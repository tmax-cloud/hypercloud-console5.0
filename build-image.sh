#!/usr/bin/env bash

set -e 
DOCKER_REGISTRY="docker.io"
CONSOLE_IMG="tmaxcloudck/hypercloud-console"
CONSOLE_VERSION="shinhan.1.0.0"
BUILD_ID="100"

#build docker image 
docker build --rm=true --build-arg=BUILD_ID=${BUILD_ID} -t ${DOCKER_REGISTRY}/${CONSOLE_IMG}:${CONSOLE_VERSION} -f ./Dockerfile .
yes | docker image prune --filter label=stage=builder --filter label=build=${BUILD_ID}

read -p "Enter the docker ID : " docker_id
read -sp "Enter the $docker_id : " docker_pw
docker login -u ${docker_id} -p ${docker_pw}
docker push ${DOCKER_REGISTRY}/${CONSOLE_IMG}:${CONSOLE_VERSION}
