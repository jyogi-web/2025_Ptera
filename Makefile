.PHONY: default gen-proto lint-proto format-proto help

default: help

help:
	@echo "Available targets:"
	@echo "  gen-proto    Generate protobuf files"
	@echo "  gen-proto-web Generate protobuf files for web"
	@echo "  lint-proto   Lint protobuf files"
	@echo "  format-proto Format protobuf files"


gen-proto:
	buf generate proto

gen-proto-web:
	buf generate proto --template buf.gen.web.yaml

lint-proto:
	buf lint proto

format-proto:
	buf format -w proto
