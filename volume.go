package main

import (
	"fmt"
)

type rDeleteVolume struct {
	VolumeName string `json:"VolumeName"`
	Error      string `json:"Error,omitempty"`
}

func (a *App) GoDeleteVolume(containerID string) rDeleteVolume {
	var errs []error
	cmd := genCmd(fmt.Sprintf(dockerCmdVolumeRemove, containerID))
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	return rDeleteVolume{
		VolumeName: string(output),
		Error:      getErrorNotice(errs),
	}
}
