//go:build darwin

package main

import (
	"io"
	"os/exec"
	"syscall"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	return res.Output()
}

func execCmdPipe(cmd []string) (*exec.Cmd, io.ReadCloser, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	stdout, err := res.StdoutPipe()
	return res, stdout, err
}

func keepAlive() {
}

func getDiskUsage() (DiskUsage, error) {
	path := "/"
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return DiskUsage{}, err
	}
	total := stat.Blocks * uint64(stat.Bsize)
	free := stat.Bavail * uint64(stat.Bsize)
	used := total - free
	return DiskUsage{Total: total, Free: free, Used: used}, nil
}
