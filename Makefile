install:
	(cd common && npm i)
	(cd services/patients && npm i)
	(cd services/devices && npm i)
	(cd services/system && npm i)

build:
	(cd common && npm run build)
	(cd services/patients && npm run build)
	(cd services/devices && npm run build)
	(cd services/system && npm run build)

lint:
	(cd common && npm run lint)
	(cd services/patients && npm run lint)
	(cd services/devices && npm run lint)
	(cd services/system && npm run lint)

.PHONY: test
test:
	(cd common && npm run "test:ci")
	(cd services/patients && npm run "test:ci")
	(cd services/devices && npm run "test:ci")
	(cd services/system && npm run "test:ci")

stress:
	(cd test/stress-tests && npm run test:ci)

testdb:
	- docker rm testdb
	docker run -p 5432:5432 --name testdb -e POSTGRES_PASSWORD=1 postgres

check: build lint test

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

minikube:
	minikube start --mount=true --mount-string=$(PWD)/data:/host/data
	minikube addons enable ingress

minikube_delete:
	minikube delete --all --purge

init_nats_db:
	cat setup/nats-streaming-server/scripts/postgres.db.sql | kubectl exec -it nats-db-depl-64555d7c49-lmz2p -- psql -h 127.0.0.1 nats_streaming 1

init:
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

	- kubectl create secret generic regcred \
    --from-file=.dockerconfigjson=$(HOME)/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson
	
volumes:
	# create a directory here to store stuff, survives minikube deletion
	mkdir -p $(PWD)/data

dev: volumes init
	skaffold dev
