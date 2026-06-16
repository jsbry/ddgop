package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/docker/docker/api/types/image"
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
	Size        string  `json:"Size"`
	Total       string  `json:"Total"`
	ProgressBar float64 `json:"ProgressBar"`
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

func (a *App) GoImages() rImages {
	defer safeRecover()

	var errs []error
	imageList, err := a.cli.ImageList(a.ctx, image.ListOptions{})
	if err != nil {
		errs = append(errs, fmt.Errorf("ImageList err: %s", err.Error()))
	}

	var size uint64
	stats := ImageStats{
		Size: "--",
	}
	images := []Image{}
	for _, i := range imageList {
		repoTags := []string{"<none>", "<none>"}
		if 0 < len(i.RepoTags) {
			repoTags = strings.Split(i.RepoTags[0], ":")
			if len(repoTags) < 2 {
				repoTags = append(repoTags, "<none>")
			}
		}

		image := Image{
			Name:      repoTags[0],
			Tag:       repoTags[1],
			CreatedAt: time.Unix(i.Created, 0).Format("2006-01-02 15:04:05"),
			Size:      formatBytes(uint64(i.Size)),
			ImageID:   i.ID,
		}
		size += uint64(i.Size)
		images = append(images, image)
	}
	stats.Size = formatBytes(size)

	du, err := getDiskUsage()
	if err != nil {
		errs = append(errs, fmt.Errorf("ImageList err: %s", err.Error()))
	}
	stats.Total = formatBytes(du.Total)
	stats.ProgressBar = float64(size) / float64(du.Total) * 100.0

	return rImages{
		Images: images,
		Stats:  stats,
		Error:  getErrorNotice(errs),
	}
}
