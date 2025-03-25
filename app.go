package main

import (
	"context"
	"fmt"
	"regexp"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

var sizeReg = regexp.MustCompile(`(\d+(\.\d+)?)(B|KB|MB|GB|TB)`)

const sizeNA = "N/A"

func formatSize(bytes float64) string {
	const (
		KiB = 1024.0
		MiB = 1024.0 * KiB
		GiB = 1024.0 * MiB
	)

	var unit string
	var value float64

	if bytes >= GiB {
		unit = "GiB"
		value = bytes / GiB
	} else if bytes >= MiB {
		unit = "MiB"
		value = bytes / MiB
	} else if bytes >= KiB {
		unit = "KiB"
		value = bytes / KiB
	} else {
		unit = "B"
		value = bytes
	}

	return fmt.Sprintf("%.2f %s", value, unit)
}

func getErrorNotice(errs []error) string {
	var n []string
	for _, errs := range errs {
		n = append(n, errs.Error())
	}
	return strings.Join(n, "\n")
}
