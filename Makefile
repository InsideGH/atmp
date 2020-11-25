install:
	(cd common && npm i)
	(cd alarm && npm i)
	(cd patients && npm i)

build:
	(cd common && npm run build)
	(cd alarm && npm run build)
	(cd patients && npm run build)

lint:
	(cd common && npm run lint)
	(cd alarm && npm run lint)
	(cd patients && npm run lint)

test:
	(cd alarm && npm run "test:ci")
	(cd patients && npm run "test:ci")

common_pub: 
	(cd common && npm run pub)

bump_patients:
	(cd patients && npm update @thelarsson/acss-common)

bump_alarm:
	(cd alarm && npm update @thelarsson/acss-common)

bump_all: bump_patients bump_alarm

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

	# alarm secrets
	- kubectl delete secret alarm-db-passwd-secret
	kubectl create secret generic alarm-db-passwd-secret --from-literal=ALARM_DB_ROOT_PASSWORD=1 --from-literal=ALARM_DB_USER_PASSWORD=1

	# patients secrets
	- kubectl delete secret patients-db-passwd-secret
	kubectl create secret generic patients-db-passwd-secret --from-literal=PATIENTS_DB_ROOT_PASSWORD=1 --from-literal=PATIENTS_DB_USER_PASSWORD=1

	# nats secrets
	- kubectl delete secret nats-db-passwd-secret
	kubectl create secret generic nats-db-passwd-secret --from-literal=NATS_DB_PASSWD=1

volumes:
	# create a directory here to store stuff
	mkdir -p $(PWD)/data

dev: volumes init
	skaffold dev
