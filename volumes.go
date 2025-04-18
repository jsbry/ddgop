package main

import (
	"fmt"

	"github.com/docker/docker/api/types/volume"
)

type rVolumes struct {
	Volumes []Volume    `json:"Volumes"`
	Stats   VolumeStats `json:"Stats"`
	Error   string      `json:"Error,omitempty"`
}

type Volume struct {
	Name   string `json:"Name"`
	Driver string `json:"Driver"`
	Size   string `json:"Size"`
}

type VolumeStats struct {
	Size string `json:"Size"`
}

type VolumeJSON struct {
	Availability string `json:"Availability"`
	Driver       string `json:"Driver"`
	Group        string `json:"Group"`
	Labels       string `json:"Labels"`
	Links        string `json:"Links"`
	Mountpoint   string `json:"Mountpoint"`
	Name         string `json:"Name"`
	Scope        string `json:"Scope"`
	Size         string `json:"Size"`
	Status       string `json:"Status"`
}

func (a *App) GoVolumes() rVolumes {
	defer safeRecover()

	var errs []error
	volumeList, err := a.cli.VolumeList(a.ctx, volume.ListOptions{})
	if err != nil {
		errs = append(errs, fmt.Errorf("VolumeList err: %s", err.Error()))
	}

	var size uint64
	stats := VolumeStats{
		Size: "--",
	}
	volumes := []Volume{}
	if 0 < len(volumeList.Volumes) {
		for _, v := range volumeList.Volumes {
			volume := Volume{
				Name:   v.Name,
				Driver: v.Driver,
				Size:   "--",
			}

			// v.Mountpoint
			// Permission denied
			if v.UsageData != nil {
				volume.Size = formatBytes(uint64(v.UsageData.Size))
				size += uint64(v.UsageData.Size)
			}

			volumes = append(volumes, volume)
		}
	}
	stats.Size = formatBytes(size)

	return rVolumes{
		Volumes: volumes,
		Stats:   stats,
		Error:   getErrorNotice(errs),
	}
}
