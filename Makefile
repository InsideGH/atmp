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
	(cd services/admin-web && docker build -f Dockerfile.prod -t insidedocker/admin-web .)

image_devices:
	(cd services/devices && docker build -f Dockerfile.prod -t insidedocker/devices .)

image_patients:
	(cd services/patients && docker build -f Dockerfile.prod -t insidedocker/patients .)

image_system:
	(cd services/system && docker build -f Dockerfile.prod -t insidedocker/system .)

image_system-web:
	(cd services/system-web && docker build -f Dockerfile.prod -t insidedocker/system-web .)

images: image_adminweb image_devices image_patients image_system image_system-web



# ------------------ DOCKER HUB PUSH
push_adminweb:
	docker push insidedocker/admin-web

push_devices:
	docker push insidedocker/devices

push_patients:
	docker push insidedocker/patients

push_system:
	docker push insidedocker/system

push_systemweb:
	docker push insidedocker/system-web

push: push_adminweb push_devices push_patients push_system push_systemweb



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
nats_setup_step_1: cluster-volumes cluster-config
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



# ------------------ PROD LOCALLY
prod: cluster-volumes cluster-config
	kubectl apply -f infra/k8s-dev
	kubectl apply -f infra/k8s

prod_stop:
	kubectl delete -f infra/k8s
	kubectl delete -f infra/k8s-dev

logs:
	kubectl logs --selector=system=panda --max-log-requests=99 -f



# ------------------ MONITORING (PROMETHEUS/GRAPHANA)
# ------------------ https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack
# ------------------ GRAFANA username: admin password: prom-operator
# Get the base64 password:
#   k get secret --namespace monitoring panda-monitor-grafana -o yaml
# echo cHJvbS1vcGVyYXRvcg== | base64 -d ---> prom-operator
#
monitoring-install:
	helm install panda-monitor prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace

monitoring-uninstall:
	helm uninstall panda-monitor
	kubectl delete crd alertmanagerconfigs.monitoring.coreos.com
	kubectl delete crd alertmanagers.monitoring.coreos.com
	kubectl delete crd podmonitors.monitoring.coreos.com
	kubectl delete crd probes.monitoring.coreos.com
	kubectl delete crd prometheuses.monitoring.coreos.com
	kubectl delete crd prometheusrules.monitoring.coreos.com
	kubectl delete crd servicemonitors.monitoring.coreos.com
	kubectl delete crd thanosrulers.monitoring.coreos.com
	kubectl delete service panda-monitor-kube-prom-kubelet -n kube-system

