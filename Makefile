# Pi5 Supernode - Unified Development Workflow
.PHONY: help install dev build test deploy clean docs health

# Default target
help: ## Show this help message
	@echo "Pi5 Supernode - Development Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$\' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
install: ## Install all dependencies (frontend + backend)
	@echo "Installing frontend dependencies..."
	npm ci
	@echo "Installing backend dependencies..."
	cd backend && for service in api-gateway network-service vpn-service automation-service; do \
		echo "Installing $$service dependencies..."; \
		cd $$service && npm ci && cd ..; \
	done

dev: ## Start development environment
	@echo "Starting all development services..."
	docker-compose up -d postgres redis prometheus grafana
	@sleep 3
	npm run dev:all

dev-frontend: ## Start only frontend development server
	npm run dev

dev-backend: ## Start only backend services
	npm run dev:backend

dev-docker: ## Start using Docker Compose
	docker-compose up -d

# Building and Testing
build: ## Build all components
	@echo "Building frontend..."
	npm run build
	@echo "Building backend services..."
	cd backend && npm run build

test: ## Run all tests
	@echo "Running frontend tests..."
	npm run test
	@echo "Running backend tests..."
	cd backend && npm run test

type-check: ## Run TypeScript type checking
	npm run type-check
	cd backend && npm run type-check

lint: ## Run ESLint
	npm run lint
	cd backend && npm run lint

lint-fix: ## Fix ESLint issues
	npm run lint:fix
	cd backend && npm run lint:fix

# Database Operations
migrate: ## Apply database migrations
	npm run migration:apply

migrate-create: ## Create new migration
	npm run migration:create

schema-generate: ## Generate TypeScript types from database schema
	npm run schema:generate

db-reset: ## Reset database (DANGER: drops all data)
	@read -p "Are you sure you want to reset the database? [y/N] \" confirm && [ "$$confirm" = "y" ]
	docker-compose down postgres
	docker volume rm pi5-supernode_postgres_data
	docker-compose up -d postgres
	@sleep 10
	npm run migration:apply

# System Operations
health: ## Check system health
	@echo "Checking system health..."
	curl -f http://localhost:3000/health || echo "API Gateway: DOWN"
	curl -f http://localhost:3001/health || echo "Network Service: DOWN"
	curl -f http://localhost:3002/health || echo "VPN Service: DOWN"
	curl -f http://localhost:3003/health || echo "Automation Service: DOWN"

status: ## Show system status
	@echo "=== Pi5 Supernode System Status ==="
	@echo "Docker containers:"
	docker-compose ps
	@echo ""
	@echo "Port status:"
	@netstat -tuln | grep -E "(3000|3001|3002|3003|5432|6379|5173)" || true

logs: ## Show all service logs
	docker-compose logs -f

logs-api: ## Show API Gateway logs
	docker-compose logs -f api-gateway

logs-network: ## Show Network Service logs
	docker-compose logs -f network-service

logs-vpn: ## Show VPN Service logs
	docker-compose logs -f vpn-service

# Cleanup
clean: ## Clean build artifacts and caches
	@echo "Cleaning build artifacts..."
	npm run clean
	cd backend && npm run clean
	@echo "Cleaning Docker resources..."
	docker system prune -f
	docker volume prune -f

clean-full: ## Full cleanup including node_modules
	@echo "Full cleanup - this will remove all node_modules..."
	rm -rf node_modules package-lock.json
	cd backend && rm -rf node_modules package-lock.json
	cd backend/api-gateway && rm -rf node_modules package-lock.json
	cd backend/network-service && rm -rf node_modules package-lock.json
	cd backend/vpn-service && rm -rf node_modules package-lock.json
	cd backend/automation-service && rm -rf node_modules package-lock.json

# Security
security-scan: ## Run security vulnerability scan
	npm audit
	cd backend && npm audit

# Performance
analyze: ## Analyze bundle size
	npm run analyze

optimize: ## Optimize project (lint, build, analyze)
	npm run optimize

# Backup and Restore
backup: ## Create system backup
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S) && \
	echo "Creating backup: backup_$$timestamp" && \
	docker-compose exec postgres pg_dump -U postgres pi5_supernode > backups/db_$$timestamp.sql && \
	tar czf backups/config_$$timestamp.tar.gz .env docker-compose.yml supabase/ && \
	echo "Backup completed: backups/backup_$$timestamp"

restore: ## Restore from backup (usage: make restore BACKUP=20240115_140000)
	@if [ -z "$(BACKUP)" ]; then echo "Usage: make restore BACKUP=20240115_140000"; exit 1; fi
	@if [ ! -f "backups/db_$(BACKUP).sql" ]; then echo "Backup file not found"; exit 1; fi
	@echo "Restoring from backup: $(BACKUP)"
	docker-compose down postgres
	docker volume rm pi5-supernode_postgres_data
	docker-compose up -d postgres
	@sleep 10
	docker-compose exec -T postgres psql -U postgres pi5_supernode < backups/db_$(BACKUP).sql
	@echo "Database restored successfully"

# Documentation
docs: ## Generate and serve documentation
	@echo "Generating API documentation..."
	@if command -v redoc-cli >/dev/null 2>&1; then \
		redoc-cli build shared/schemas/openapi.yaml --output docs/api.html; \
		echo "API documentation generated: docs/api.html"; \
	else \
		echo "Install redoc-cli to generate API docs: npm install -g redoc-cli"; \
	fi

docs-serve: ## Serve documentation locally
	@if command -v http-server >/dev/null 2>&1; then \
		http-server docs -p 8080; \
	else \
		echo "Install http-server to serve docs: npm install -g http-server"; \
	fi

# Deployment
deploy-dev: ## Deploy to development environment
	@echo "Deploying to development..."
	docker-compose -f docker-compose.dev.yml up -d --build

deploy-prod: ## Deploy to production environment
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d --build

# System Monitoring
monitor: ## Open monitoring dashboards
	@echo "Opening monitoring dashboards..."
	@if command -v open >/dev/null 2>&1; then \
		open http://localhost:3100; \
		open http://localhost:9090; \
	else \
		echo "Grafana: http://localhost:3100"; \
		echo "Prometheus: http://localhost:9090"; \
	fi

# Quick Commands
quick-start: install dev ## Quick start for new developers

quick-reset: clean-full install migrate dev ## Complete reset and restart

quick-deploy: test build deploy-dev ## Quick deployment pipeline