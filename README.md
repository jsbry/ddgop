# ddgop

![Containers Page](doc/containers.png "Containers")

## dev

- `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- `wails init -n ddgop -t react-ts`
- `wails dev`

## WSL/~~VirtualBox~~

- Execute only the required steps:
    1. `vi /etc/docker/daemon.json`

        ```json
        {
            "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
        }
        ```

    2. `chown root:root /etc/docker/daemon.json`
    3. `chmod 644 /etc/docker/daemon.json`
    4. `systemctl edit docker`
        1. or `vi /etc/systemd/system/docker.service.d/override.conf`

        ```conf
        [Service]
        ExecStart=
        ExecStart=/usr/bin/dockerd --containerd=/run/containerd/containerd.sock
        ```

    5. `systemctl restart docker`
    6. `systemctl status docker`
        - old: `/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock`
        - new: `/usr/bin/dockerd --containerd=/run/containerd/containerd.sock`
    7. `firewall-cmd --add-port 2375/tcp --permanent --zone=public`
    8. `firewall-cmd --reload`
