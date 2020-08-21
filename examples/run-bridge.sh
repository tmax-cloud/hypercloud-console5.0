#!/usr/bin/env bash
set -exuo pipefail

myIP=$(ipconfig | grep "IPv4" -a | head -1 | awk '{print $NF}')
./bin/bridge \
    --listen=http://$myIP:9000 \
    --base-address=http://$myIP:9000 \
    --ca-file=examples/ca.crt \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint=https://192.168.6.196:6443 \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --k8s-auth=bearer-token \
    --k8s-auth-bearer-token=@@ \
    --public-dir=./frontend/public/dist \
    --user-auth=disabled \