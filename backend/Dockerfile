# ビルドステージ
FROM golang:1.25-alpine AS builder

ENV ROOT=/go/src/app
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64
WORKDIR ${ROOT}

RUN apk update && apk add --no-cache git make
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# 静的バイナリをビルド
RUN go build -o /app/server -ldflags="-s -w" -trimpath cmd/server/main.go

# ランタイムステージ
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# ビルドステージからバイナリをコピー
COPY --from=builder /app/server .

EXPOSE 50051

CMD ["./server"]