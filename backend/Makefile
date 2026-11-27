GO ?= go

.PHONY: build test vet run fmt tidy docker-up docker-down

build:
	$(GO) build ./...

test:
	$(GO) test ./...

vet:
	$(GO) vet ./...

run:
	$(GO) run ./cmd/api

fmt:
	gofmt -w ./cmd ./internal

tidy:
	$(GO) mod tidy

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
