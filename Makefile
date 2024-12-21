.PHONY: dev
dev:
	wails dev

.PHONY: build
build:
	wails build -ldflags "-s -w -H windowsgui" -trimpath
