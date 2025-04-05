package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
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
	var errs []error
	cmd := genCmd(dockerCmdVolumeList)
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	var size uint64
	stats := VolumeStats{
		Size: "--",
	}
	volumes := []Volume{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var vj VolumeJSON
		json.Unmarshal([]byte(line), &vj)

		volume := Volume{
			Name:   vj.Name,
			Driver: vj.Driver,
			Size:   vj.Size,
		}

		// Size
		if volume.Size != sizeNA {
			match := sizeReg.FindStringSubmatch(volume.Size)
			if len(match) < 4 {
				errs = append(errs, fmt.Errorf("size match len < 4: %s", volume.Size))
				continue
			}
			value, err := strconv.ParseUint(match[1], 10, 64)
			if err != nil {
				errs = append(errs, fmt.Errorf("error parsing size value: %s", err.Error()))
				continue
			}
			unit := match[3]
			if multiplier, exists := sizeUnitMap[unit]; exists {
				size += value * multiplier
			} else {
				errs = append(errs, fmt.Errorf("unknown unit: %s", unit))
			}
		}
		volumes = append(volumes, volume)
	}
	stats.Size = formatBytes(size)

	return rVolumes{
		Volumes: volumes,
		Stats:   stats,
		Error:   getErrorNotice(errs),
	}
}
