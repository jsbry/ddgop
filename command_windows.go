//go:build windows

package main

import (
	"io"
	"os/exec"
	"syscall"
	"time"
	"unsafe"
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

func getDiskUsage() (DiskUsage, error) {
	path := "C:\\"
	kernel32 := syscall.MustLoadDLL("kernel32.dll")
	proc := kernel32.MustFindProc("GetDiskFreeSpaceExW")

	lpFreeBytesAvailable := int64(0)
	lpTotalNumberOfBytes := int64(0)
	lpTotalNumberOfFreeBytes := int64(0)

	ptr, _ := syscall.UTF16PtrFromString(path)
	ret, _, err := proc.Call(
		uintptr(unsafe.Pointer(ptr)),
		uintptr(unsafe.Pointer(&lpFreeBytesAvailable)),
		uintptr(unsafe.Pointer(&lpTotalNumberOfBytes)),
		uintptr(unsafe.Pointer(&lpTotalNumberOfFreeBytes)),
	)
	if ret == 0 {
		return DiskUsage{}, err
	}

	total := uint64(lpTotalNumberOfBytes)
	free := uint64(lpTotalNumberOfFreeBytes)
	used := total - free
	return DiskUsage{Total: total, Free: free, Used: used}, nil
}
