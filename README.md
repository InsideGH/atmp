# Panda care

## First time

- make install
- make check
- make minikube
- make nats_setup_step_1
> wait until the `nats-db-depl` pod is ready (kubectl get po)
- make nats_setup_step_2
- make nats_setup_step_3

> then
- `minikube ip` gives you the IP, for example `192.168.49.2`.
- put this into your /etc/hosts file
    - `192.168.49.2 system.acss.dev admin.acss.dev`

## Start dev env
- make dev

## Stop dev env
- To stop, press CTRL-C and wait for skaffold to finish cleaning up.

