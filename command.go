package main

import (
	"io"
	"os/exec"
	"runtime"
	"syscall"
)

const (
// dockerCmdContainerStart   = "docker container start %s"
// dockerCmdContainerStop    = "docker container stop %s"
// dockerCmdContainerRemove  = "docker container rm -f %s"
// dockerCmdContainerPause   = "docker container pause %s"
// dockerCmdContainerUnpause = "docker container unpause %s"
// dockerCmdContainerRestart = "docker container restart %s"
// dockerCmdContainerLogs = "docker container logs %s --timestamps -f"
// dockerCmdContainerInspect = "docker container inspect %s --format '{{json .}}'"
// dockerCmdContainerList = "docker container ls -a --no-trunc --format '{{json .}}'"
// dockerCmdContainerStats   = "docker container stats --no-trunc --no-stream --format '{{json .}}' %s"
// dockerCmdContainerExecLS = "docker container exec %s ls -la --time-style=\"+%%Y-%%m-%%d %%H:%%M:%%S\" %s"
// dockerCmdContainerRun     = "docker container run -it --rm %s %s"
// dockerCmdContainersStats  = "docker container stats -a --no-trunc --no-stream --format '{{json .}}'"
// dockerCmdImageList     = "docker image ls -a --no-trunc --format '{{json .}}'"
// dockerCmdImageRemove   = "docker image rm -f %s"
// dockerCmdNetworkList   = "docker network ls --no-trunc --format '{{json .}}'"
// dockerCmdNetworkRemove = "docker network rm -f %s"
// dockerCmdVolumeList    = "docker volume ls --format '{{json .}}'"
// dockerCmdVolumeRemove  = "docker volume rm -f %s"
)

func genCmd(cmd string) []string {
	cmds := []string{
		"sh", "-c", cmd,
	}
	if runtime.GOOS == "windows" {
		cmds = append([]string{"wsl.exe"}, cmds...)
	}

	return cmds
}

func execCmd(cmd []string) ([]byte, error) {
	var res *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		res = exec.Command(cmd[0], cmd[1:]...)
		// res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		res.SysProcAttr = &syscall.SysProcAttr{}
	case "darwin", "linux":
		res = exec.Command(cmd[0], cmd[1:]...)
	}
	return res.Output()
}

func execCmdPipe(cmd []string) (*exec.Cmd, io.ReadCloser, error) {
	var res *exec.Cmd
	var stdout io.ReadCloser
	var err error
	switch runtime.GOOS {
	case "windows":
		res = exec.Command(cmd[0], cmd[1:]...)
		res.SysProcAttr = &syscall.SysProcAttr{}
		// res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		stdout, err = res.StdoutPipe()
	case "darwin", "linux":
		res = exec.Command(cmd[0], cmd[1:]...)
		stdout, err = res.StdoutPipe()
	}
	return res, stdout, err
}
