minikube:
	minikube start --mount=true --mount-string=$(PWD)/data:/host/data --driver=hyperkit

minikube_delete:
	minikube delete --all

minikube_purge:
	minikube delete --all --purge

init:
	minikube addons enable ingress
	- kubectl delete secret alarm-db-passwd-secret
	kubectl create secret generic alarm-db-passwd-secret --from-literal=ALARM_DB_ROOT_PASSWORD=1 --from-literal=ALARM_DB_USER_PASSWORD=1
	kubectl apply -f infra/k8s-init/*

dev:
	skaffold dev
