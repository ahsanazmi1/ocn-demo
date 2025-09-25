# OCN Demo Makefile
# Quick commands for running the AI explainability demo

.PHONY: help submodules pin up down logs smoke clean

# Default target
help:
	@echo "OCN AI Explainability Demo"
	@echo "========================="
	@echo ""
	@echo "Available targets:"
	@echo "  submodules  - Initialize and update git submodules"
	@echo "  pin         - Pin all submodules to v0.2.0 tags"
	@echo "  up          - Start all services with Docker Compose"
	@echo "  down        - Stop all services and remove volumes"
	@echo "  logs        - Show logs from all services"
	@echo "  smoke       - Run the complete demo smoke test"
	@echo "  clean       - Clean up demo outputs and containers"
	@echo ""
	@echo "Quick start:"
	@echo "  1. cp .env.example .env"
	@echo "  2. make submodules"
	@echo "  3. make pin"
	@echo "  4. make up"
	@echo "  5. sleep 5"
	@echo "  6. make smoke"
	@echo ""

# Initialize and update git submodules
submodules:
	@echo "📦 Initializing git submodules..."
	git submodule update --init --recursive
	git submodule foreach 'git fetch --tags'
	@echo "✅ Submodules initialized"

# Pin all submodules to phase-2-explainability branches (includes Dockerfiles)
pin:
	@echo "📌 Pinning submodules to phase-2-explainability branches..."
	@for submodule in agents/orca agents/orion agents/weave; do \
		if [ -d "$$submodule" ]; then \
			echo "Pinning $$submodule to phase-2-explainability..."; \
			cd "$$submodule"; \
			git checkout phase-2-explainability; \
			cd - > /dev/null; \
		else \
			echo "❌ Submodule $$submodule not found. Run 'make submodules' first."; \
			exit 1; \
		fi; \
	done
	@echo "✅ All submodules pinned to phase-2-explainability branches"

# Start all services
up:
	@echo "🚀 Starting OCN services..."
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose --env-file .env up -d --build; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose --env-file=.env up -d --build; \
	else \
		echo "❌ Docker Compose not found. Please install Docker Compose."; \
		exit 1; \
	fi
	@echo "✅ Services started"
	@echo "📋 Check status with: make status"
	@echo "📋 View logs with: make logs"

# Stop all services and remove volumes
down:
	@echo "🛑 Stopping OCN services..."
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose down -v; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose down -v; \
	else \
		echo "❌ Docker Compose not found."; \
		exit 1; \
	fi
	@echo "✅ Services stopped and volumes removed"

# Show logs from all services
logs:
	@echo "📋 Showing logs from all services..."
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose logs -f --tail=200; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose logs -f --tail=200; \
	else \
		echo "❌ Docker Compose not found."; \
		exit 1; \
	fi

# Show service status
status:
	@echo "📊 Service status:"
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose ps; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose ps; \
	else \
		echo "❌ Docker Compose not found."; \
		exit 1; \
	fi

# Run the smoke test demo
smoke:
	@echo "🧪 Running OCN AI Explainability Demo..."
	bash scripts/smoke_demo.sh

# Clean up demo outputs and containers
clean:
	@echo "🧹 Cleaning up..."
	rm -f .out_*.json
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose down -v 2>/dev/null || true; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose down -v 2>/dev/null || true; \
	fi
	docker system prune -f 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Development helpers
dev-up: up
	@echo "🔧 Development mode - services running"
	@echo "📋 Make changes and use 'make smoke' to test"

dev-logs:
	@if command -v docker-compose >/dev/null 2>&1; then \
		docker-compose logs -f --tail=50 weave; \
	elif docker compose version >/dev/null 2>&1; then \
		docker compose logs -f --tail=50 weave; \
	else \
		echo "❌ Docker Compose not found."; \
		exit 1; \
	fi

dev-restart: down up
	@echo "🔄 Services restarted"

# Health checks
health:
	@echo "🏥 Checking service health..."
	@for port in 8080 8081 8082; do \
		if curl -s http://localhost:$$port/health > /dev/null 2>&1; then \
			echo "✅ Service on port $$port is healthy"; \
		else \
			echo "❌ Service on port $$port is not responding"; \
		fi; \
	done
