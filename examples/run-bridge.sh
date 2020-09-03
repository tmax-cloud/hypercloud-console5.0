#!/usr/bin/env bash

set -exuo pipefail

./bin/bridge \
    --base-address=http://localhost:9000 \
    --ca-file=examples/ca.crt \
    --k8s-mode=off-cluster \
    --listen=http://127.0.0.1:9000 \
    --k8s-mode-off-cluster-endpoint=https://172.22.6.2:6443 \
    --public-dir=./frontend/public/dist \
    --k8s-auth-bearer-token=@@ \
    --k8s-auth=bearer-token \    
    --k8s-mode-off-cluster-skip-verify-tls=true \
