.PHONY: default up down logs help up-dev up-prod build

default: help

help:
	@echo "Available targets:"
	@echo "  up-dev       Start in development mode (hot reload)"
	@echo "  up-prod      Start in production mode (compiled binary)"
	@echo "  up           Alias for up-dev"
	@echo "  down-dev     Stop development environment"
	@echo "  down-prod    Stop production environment"
	@echo "  down         Stop current environment"
	@echo "  logs-dev     Show development logs"
	@echo "  logs-prod    Show production logs"

# 開発環境 (デフォルト): Dockerfile.devを使用、ホットリロード
up-dev:
	docker-compose -f ../docker-compose.dev.yaml up

# デフォルトは開発環境
up: up-dev

# 本番環境: Dockerfileを使用、ビルド済みバイナリ
up-prod:
	docker-compose -f ../docker-compose.yaml up -d --build

down-dev:
	docker-compose -f ../docker-compose.dev.yaml down

down-prod:
	docker-compose -f ../docker-compose.yaml down

# デフォルトは開発環境を停止
down: down-dev

logs-dev:
	docker-compose -f ../docker-compose.dev.yaml logs -f

logs-prod:
	docker-compose -f ../docker-compose.yaml logs -f

# デフォルトは開発環境のログ
logs: logs-dev
