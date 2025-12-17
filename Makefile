.PHONY: default gen-proto lint-proto format-proto help

default: help

help:
	@echo "Available targets:"
	@echo "  gen-proto    Generate protobuf files"
	@echo "  lint-proto   Lint protobuf files"
	@echo "  format-proto Format protobuf files"


gen-proto:
	buf generate proto

lint-proto:
	buf lint proto

format-proto:
	buf format -d proto
