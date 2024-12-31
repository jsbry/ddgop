package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type rImages struct {
	Images []Image    `json:"Images"`
	Stats  ImageStats `json:"Stats"`
	Error  string     `json:"Error,omitempty"`
}

type Image struct {
	Name         string `json:"Name"`
	Tag          string `json:"Tag"`
	CreatedAt    string `json:"CreatedAt"`
	CreatedSince string `json:"CreatedSince"`
	Size         string `json:"Size"`
	ImageID      string `json:"ImageID"`
}

type ImageStats struct {
	Size string `json:"Size"`
}

type ImageJSON struct {
	Containers   string `json:"Containers"`
	CreatedAt    string `json:"CreatedAt"`
	CreatedSince string `json:"CreatedSince"`
	Digest       string `json:"Digest"`
	ID           string `json:"ID"`
	Repository   string `json:"Repository"`
	SharedSize   string `json:"SharedSize"`
	Size         string `json:"Size"`
	Tag          string `json:"Tag"`
	UniqueSize   string `json:"UniqueSize"`
	VirtualSize  string `json:"VirtualSize"`
}

var imageSizeReg = regexp.MustCompile(`(\d+(\.\d+)?)(B|KB|MB|GB|TB)`)

var sizeUnitMap = map[string]float64{
	"B":  1,
	"KB": 1024,
	"MB": 1024 * 1024,
	"GB": 1024 * 1024 * 1024,
}

func (a *App) GoImages() rImages {
	var errs []error
	cmd := genCmd("docker image ls -a --no-trunc --format '{{json .}}'")
	output, err := execCmd(cmd)
	if err != nil {
		errs = append(errs, fmt.Errorf("execCmd err: %s", err.Error()))
	}
	writeBytes("output.log", output)

	size := 0.0
	stats := ImageStats{
		Size: "--",
	}
	images := []Image{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		var ij ImageJSON
		json.Unmarshal([]byte(line), &ij)

		parsedTime, err := time.Parse("2006-01-02 15:04:05 -0700 MST", ij.CreatedAt)
		if err != nil {
			errs = append(errs, fmt.Errorf("time.Parse err: %s", err.Error()))
			continue
		}
		image := Image{
			Name:      ij.Repository,
			Tag:       ij.Tag,
			CreatedAt: parsedTime.Format("2006-01-02 15:04:05"),
			Size:      ij.Size,
			ImageID:   ij.ID,
		}

		// Size
		match := imageSizeReg.FindStringSubmatch(image.Size)
		if len(match) < 4 {
			errs = append(errs, fmt.Errorf("size match len < 4: %s", image.Size))
			continue
		}
		value, err := strconv.ParseFloat(match[1], 64)
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
		images = append(images, image)
	}
	stats.Size = formatSize(size)

	return rImages{
		Images: images,
		Stats:  stats,
		Error:  getErrorNotice(errs),
	}
}
