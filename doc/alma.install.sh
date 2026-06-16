#!/bin/sh

sudo dnf -y update
sudo rpm --import https://download.docker.com/linux/centos/gpg
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

sudo dnf remove docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine

sudo dnf install -y docker-ce docker-ce-cli docker-buildx-plugin docker-compose-plugin

sudo systemctl start docker
sudo systemctl enable docker

user=$(whoami)
sudo usermod -aG docker $user

newgrp docker
