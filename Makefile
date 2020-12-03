install:
	(cd common && npm i)
	(cd patients && npm i)
	(cd devices && npm i)
	(cd system && npm i)

build:
	(cd common && npm run build)
	(cd patients && npm run build)
	(cd devices && npm run build)
	(cd system && npm run build)

lint:
	(cd common && npm run lint)
	(cd patients && npm run lint)
	(cd devices && npm run lint)
	(cd system && npm run lint)

test:
	(cd common && npm run "test:ci")
	(cd patients && npm run "test:ci")
	(cd devices && npm run "test:ci")
	(cd system && npm run "test:ci")

testdb:
	- docker rm testdb
	docker run -p 5432:5432 --name testdb -e POSTGRES_PASSWORD=1 postgres

check: build lint test

common_pub: 
	(cd common && npm run pub)

bump_patients:
	(cd patients && npm update @thelarsson/acss-common)

bump_devices:
	(cd devices && npm update @thelarsson/acss-common)

bump_system:
	(cd system && npm update @thelarsson/acss-common)

bump_all: bump_patients bump_devices bump_system

minikube:
	minikube start --mount=true --mount-string=$(PWD)/data:/host/data
	minikube addons enable ingress

minikube_delete:
	minikube delete --all --purge

init_nats_db:
	cat nats-streaming-server/scripts/postgres.db.sql | kubectl exec -it nats-db-depl-64555d7c49-lmz2p -- psql -h 127.0.0.1 nats_streaming 1

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

volumes:
	# create a directory here to store stuff
	mkdir -p $(PWD)/data

dev: volumes init
	skaffold dev
