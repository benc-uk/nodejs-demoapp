# Used by `image`, `push` & `deploy` targets, override as required
IMAGE_REG ?= ghcr.io
IMAGE_REPO ?= benc-uk/nodejs-demoapp
IMAGE_TAG ?= latest

# Used by `deploy` target, sets Azure deployment defaults, override as required
AZURE_RES_GROUP ?= demoapps
AZURE_REGION ?= northeurope
AZURE_APP_NAME ?= nodejs-demoapp

# Used by test targets
TEST_BASE_URL ?= http://localhost:3000
TEST_FILES ?= base-tests.http

# Don't change
SRC_DIR := src

.EXPORT_ALL_VARIABLES:
.PHONY: help lint lint-fix image push run deploy undeploy clean test test-report .EXPORT_ALL_VARIABLES
.DEFAULT_GOAL := help

help: ## 💬 This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: $(SRC_DIR)/node_modules ## 🔎 Lint & format, will not fix but sets exit code on error 
	cd $(SRC_DIR); npm run lint

lint-fix: $(SRC_DIR)/node_modules ## 📜 Lint & format, will try to fix errors and modify code
	cd $(SRC_DIR); npm run lint-fix

image: ## 🔨 Build container image from Dockerfile 
	docker build . --file build/Dockerfile \
	--tag $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

push: ## 📤 Push container image to registry 
	docker push $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

run: $(SRC_DIR)/node_modules ## 🏃 Run locally using Node.js
	cd $(SRC_DIR); npm run watch
	
deploy: ## 🚀 Deploy to Azure Container App 
	az group create --resource-group $(AZURE_RES_GROUP) --location $(AZURE_REGION) -o table
	az deployment group create --template-file deploy/container-app.bicep \
		--resource-group $(AZURE_RES_GROUP) \
		--parameters appName=$(AZURE_APP_NAME) \
		--parameters image=$(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG) -o table 
	@sleep 5
	@echo "### 🚀 App deployed & available here: $(shell az deployment group show --resource-group $(AZURE_RES_GROUP) --name container-app --query "properties.outputs.appURL.value" -o tsv)/"

undeploy: ## 💀 Remove from Azure 
	@echo "### WARNING! Going to delete $(AZURE_RES_GROUP) 😲"
	az group delete -n $(AZURE_RES_GROUP) -o table --no-wait

test: $(SRC_DIR)/node_modules ## 🚦 Run integration tests, server must be running 
	$(SRC_DIR)/node_modules/.bin/httpyac $(SRC_DIR)/tests/$(TEST_FILES) --all --output short --var baseUrl=$(TEST_BASE_URL)

test-report: $(SRC_DIR)/node_modules ## 🤡 Tests but with JUnit output, server must be running 
	$(SRC_DIR)/node_modules/.bin/httpyac $(SRC_DIR)/tests/$(TEST_FILES) --all --junit --var baseUrl=$(TEST_BASE_URL) > test-results.xml

clean: ## 🧹 Clean up project
	rm -rf $(SRC_DIR)/node_modules
	rm -rf src/*.xml
	rm -rf *.xml

# ============================================================================

$(SRC_DIR)/node_modules: $(SRC_DIR)/package.json
	cd $(SRC_DIR); npm install
	touch -m $(SRC_DIR)/node_modules

$(SRC_DIR)/package.json: 
	@echo "package.json was modified"
