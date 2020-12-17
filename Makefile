# ------------------ INSTALL
install:
	(cd common && npm i)
	(cd services/patients && npm i)
	(cd services/devices && npm i)
	(cd services/system && npm i)
	(cd services/system-web && npm i)
	(cd services/admin-web && npm i)



# ------------------ BUILDS (NOT IMAGES)
build_admin-web:
	(cd services/admin-web && npm run build)

build_patients:
	(cd services/patients && npm run build)

build_system:
	(cd services/system && npm run build)

build_system-web:
	(cd services/system-web && npm run build)

build: build_admin-web build_patients build_system build_system-web



# ------------------ LINT
lint_admin-web:
	(cd services/admin-web && npm run lint)

lint_patients:
	(cd services/patients && npm run lint)

lint_system:
	(cd services/system && npm run lint)

lint_system-web:
	(cd services/system-web && npm run lint)

lint: lint_admin-web lint_patients lint_system lint_system-web



# ------------------ TEST
test_common:
	(cd common && npm run test:ci)

test_patients:
	(cd services/patients && npm run test:ci)

test_devices:
	(cd services/devices && npm run test:ci)

test_system:
	(cd services/system && npm run test:ci)

.PHONY: test
test: test_common test_devices test_patients test_system



# ------------------ CHECK (build + lint + test)
check: build lint test



# ------------------ DOCKER IMAGES
image_adminweb:
	(cd services/admin-web && docker build -f Dockerfile.prod -t panda-admin-web .)

image_devices:
	(cd services/devices && docker build -f Dockerfile.prod -t panda-devices .)

image_patients:
	(cd services/patients && docker build -f Dockerfile.prod -t panda-patients .)

image_system:
	(cd services/system && docker build -f Dockerfile.prod -t panda-system .)

image_system-web:
	(cd services/system-web && docker build -f Dockerfile.prod -t panda-system-web .)

images: image_adminweb image_devices image_patients image_system image_system-web



# ------------------ MISC
stress:
	(cd test/cluster-stress-tests && npm run test:ci)

testdb:
	- docker rm testdb
	docker run -p 5432:5432 --name testdb -e POSTGRES_PASSWORD=1 postgres



# ------------------ COMMON NPM MODULE (publish + update all services reference through package.json)
common_pub: 
	(cd common && npm run pub)

bump_patients:
	(cd services/patients && ncu --filter @thelarsson/acss-common -u && npm i)

bump_devices:
	(cd services/devices && ncu --filter @thelarsson/acss-common -u && npm i)

bump_system:
	(cd services/system && ncu --filter @thelarsson/acss-common -u && npm i)

bump_all: bump_patients bump_devices bump_system

common: common_pub bump_all



# ------------------ MINIKUBE
minikube:
	minikube start --mount=true --mount-string=$(PWD)/data:/host/data
	minikube addons enable ingress

minikube_delete:
	minikube delete --all --purge



# ------------------ NATS ONE TIME SETUP STEPS (CHECK README FILE)
nats_setup_step_1: cluster-config
	kubectl apply -f infra/k8s-dev/nats-db-pvc.yaml
	kubectl apply -f infra/k8s/nats-db-depl.yaml
nats_setup_step_2:
	$(eval PODNAME = $(shell sh -c "kubectl get pod -l "app=nats-db" --namespace=default -o jsonpath='{.items[0].metadata.name}'"))
	cat setup/nats-streaming-server/scripts/postgres.db.sql | kubectl exec -it $(PODNAME) -- psql -h 127.0.0.1 nats_streaming 1
nats_setup_step_3:
	kubectl delete -f infra/k8s/nats-db-depl.yaml
	kubectl delete -f infra/k8s-dev/nats-db-pvc.yaml
# ------------------ NATS DROP
nats_drop:
	$(eval PODNAME = $(shell sh -c "kubectl get pod -l "app=nats-db" --namespace=default -o jsonpath='{.items[0].metadata.name}'"))
	cat setup/nats-streaming-server/scripts/drop_postgres.db.sql | kubectl exec -it $(PODNAME) -- psql -h 127.0.0.1 nats_streaming 1



# ------------------ LOCAL CLUSTER SPINUP (DEV)
cluster-config:
	# config maps
	kubectl apply -f infra/k8s-init

	# patients secrets
	- kubectl delete secret patients-db-passwd-secret
	kubectl create secret generic patients-db-passwd-secret --from-literal=PATIENTS_DB_ROOT_PASSWORD=1 --from-literal=PATIENTS_DB_USER_PASSWORD=1

	# devices secrets
	- kubectl delete secret devices-db-passwd-secret
	kubectl create secret generic devices-db-passwd-secret --from-literal=DEVICES_DB_ROOT_PASSWORD=1 --from-literal=DEVICES_DB_USER_PASSWORD=1

	# system secrets
	- kubectl delete secret system-db-passwd-secret
	kubectl create secret generic system-db-passwd-secret --from-literal=SYSTEM_DB_ROOT_PASSWORD=1 --from-literal=SYSTEM_DB_USER_PASSWORD=1

	# nats secrets
	- kubectl delete secret nats-db-passwd-secret
	kubectl create secret generic nats-db-passwd-secret --from-literal=NATS_DB_PASSWD=1

	# get around annoying docker hub rate limit by using the docker login'ed user through a secret that is used by the deployments files to make image pulls.
	- kubectl create secret generic regcred \
    --from-file=.dockerconfigjson=$(HOME)/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson
	
cluster-volumes:
	# create a directory here to store stuff, survives minikube deletion
	mkdir -p $(PWD)/data

dev: cluster-volumes cluster-config
	skaffold dev


# ------------------ STRESS TEST
restart_devices:
	$(eval PODNAME = $(shell sh -c "kubectl get pod -l "app=devices" --namespace=default -o jsonpath='{.items[0].metadata.name}'"))
	kubectl delete pod $(PODNAME)

restart_nats:
	$(eval PODNAME = $(shell sh -c "kubectl get pod -l "app=nats" --namespace=default -o jsonpath='{.items[0].metadata.name}'"))
	kubectl delete pod $(PODNAME)
