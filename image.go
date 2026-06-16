package main

import (
	"fmt"

	"github.com/docker/docker/api/types/image"
)

type rDeleteImage struct {
	Images []image.DeleteResponse `json:"Images"`
	Error  string                 `json:"Error,omitempty"`
}

func (a *App) GoDeleteImage(imageID string, force bool) rDeleteImage {
	defer safeRecover()

	var errs []error
	imageList, err := a.cli.ImageRemove(a.ctx, imageID, image.RemoveOptions{
		Force: force,
	})
	if err != nil {
		errs = append(errs, fmt.Errorf("ImageRemove err: %s", err.Error()))
	}

	return rDeleteImage{
		Images: imageList,
		Error:  getErrorNotice(errs),
	}
}
