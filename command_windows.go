//go:build windows

package main

import (
	"io"
	"os/exec"
	"syscall"
	"time"
)

func execCmd(cmd []string) ([]byte, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return res.Output()
}

func execCmdPipe(cmd []string) (*exec.Cmd, io.ReadCloser, error) {
	res := exec.Command(cmd[0], cmd[1:]...)
	res.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	stdout, err := res.StdoutPipe()
	return res, stdout, err
}

func keepAlive() {
	for {
		cmd := exec.Command("wsl.exe", "--exec", "tail", "-f", "/dev/null")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true} // ウィンドウ非表示
		err := cmd.Start()
		if err != nil {
			time.Sleep(10 * time.Second)
			continue
		}

		cmd.Wait()
	}
}
