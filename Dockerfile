FROM golang:1.23

RUN apt-get update && apt-get install -y npm mingw-w64

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN rm -rf /app/frontend/node_modules/

RUN go install github.com/wailsapp/wails/v2/cmd/wails@v2.9.3

ENV CC=x86_64-w64-mingw32-gcc \
    CXX=x86_64-w64-mingw32-g++ \
    CGO_ENABLED=1 \
    GOOS=windows \
    GOARCH=amd64

RUN wails build -ldflags "-s -w -H windowsgui -X main.debug=off" -trimpath -platform windows/amd64

