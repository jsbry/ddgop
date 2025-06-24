#!/bin/bash
set -e

IMAGE_NAME=go-build
CONTAINER_NAME=go-build-container
OUTPUT_FILE=ddgop.exe

# Docker build
docker build -t $IMAGE_NAME .

# コンテナからビルド済みファイルをコピー
docker create --name $CONTAINER_NAME $IMAGE_NAME
docker cp $CONTAINER_NAME:/app/$OUTPUT_FILE ./$OUTPUT_FILE
docker container rm $CONTAINER_NAME
