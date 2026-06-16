package main

import (
	"fmt"
)

type rDeleteVolume struct {
	VolumeName string `json:"VolumeName"`
	Error      string `json:"Error,omitempty"`
}

func (a *App) GoDeleteVolume(volumeID string) rDeleteVolume {
	defer safeRecover()

	var errs []error
	err := a.cli.VolumeRemove(a.ctx, volumeID, false)
	if err != nil {
		errs = append(errs, fmt.Errorf("VolumeRemove err: %s", err.Error()))
	}

	return rDeleteVolume{
		VolumeName: volumeID,
		Error:      getErrorNotice(errs),
	}
}
