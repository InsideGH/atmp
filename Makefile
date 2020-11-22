minikube_hyperkit:
	# Ingress "minikube addons ..." is working with this variant
	# But not file mounts on MacOS, permission problems with MariaDb and Postgres. 
	# With postgres there are also problems with file system links not supported (it seemes like)
	minikube start --mount=true --mount-string=$(PWD)/data:/host/data --driver=hyperkit
	minikube addons enable ingress

minikube_docker_desktop:
	# Ingress "minikube addons ..." is NOT working with this variant.
	# However, the file mount on MacOS don't have any problems with MariaDb and Postgres.
	minikube start --driver=docker

minikube_delete:
	minikube delete --all

minikube_purge:
	minikube delete --all --purge

docker_desktop:
	# create a directory here to store stuff
	mkdir -p /tmp/acss/alarm
	mkdir -p /tmp/acss/patients
	mkdir -p /tmp/acss/nats
	# https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml

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

initnats:
	k apply -f infra/k8s-dev/nats-db-pvc.yaml
	k apply -f infra/k8s/nats-db-depl.yaml

dev:
	skaffold dev

start_docker_desktop_mac: init dev
