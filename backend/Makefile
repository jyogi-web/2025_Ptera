.PHONY: default up down logs help

default: help

help:
	@echo "Available targets:"
	@echo "  up           Start docker-compose"
	@echo "  down         Stop docker-compose"
	@echo "  logs         Show docker-compose logs"

up:
	docker-compose -f ../docker-compose.yaml up -d

down:
	docker-compose -f ../docker-compose.yaml down

logs:
	docker-compose -f ../docker-compose.yaml logs -f
