.PHONY: up down logs help

default: help

help:
	@echo "Available targets:"
	@echo "  up           Start docker-compose"
	@echo "  down         Stop docker-compose"
	@echo "  logs         Show docker-compose logs"

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f
