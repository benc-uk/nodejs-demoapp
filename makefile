# Used by `image`, `push` & `deploy` targets, override as required
IMAGE_REG ?= ghcr.io
IMAGE_REPO ?= benc-uk/nodejs-demoapp
IMAGE_TAG ?= latest

# Used by `deploy` target, sets Azure webap defaults, override as required
AZURE_RES_GROUP ?= temp-demoapps
AZURE_REGION ?= uksouth
AZURE_SITE_NAME ?= nodeapp-$(shell git rev-parse --short HEAD)

# Used by `test-api` target
TEST_HOST ?= localhost:3000

# Don't change
SRC_DIR := src

.PHONY: help lint lint-fix image push run deploy undeploy clean test test-api test-report .EXPORT_ALL_VARIABLES
.DEFAULT_GOAL := help

help:  ## 💬 This help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: $(SRC_DIR)/node_modules  ## 🔎 Lint & format, will not fix but sets exit code on error 
	cd $(SRC_DIR); npm run lint

lint-fix: $(SRC_DIR)/node_modules  ## 📜 Lint & format, will try to fix errors and modify code
	cd $(SRC_DIR); npm run lint-fix

image:  ## 🔨 Build container image from Dockerfile 
	docker build . --file build/Dockerfile \
	--tag $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

push:  ## 📤 Push container image to registry 
	docker push $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

run: $(SRC_DIR)/node_modules  ## 🏃 Run locally using Node.js
	cd $(SRC_DIR); npm run watch

deploy:  ## 🚀 Deploy to Azure Web App 
	az group create --resource-group $(AZURE_RES_GROUP) --location $(AZURE_REGION) -o table
	az deployment group create --template-file deploy/webapp.bicep \
		--resource-group $(AZURE_RES_GROUP) \
		--parameters webappName=$(AZURE_SITE_NAME) \
		--parameters webappImage=$(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG) -o table 
	@echo "### 🚀 Web app deployed to https://$(AZURE_SITE_NAME).azurewebsites.net/"

undeploy:  ## 💀 Remove from Azure 
	@echo "### WARNING! Going to delete $(AZURE_RES_GROUP) 😲"
	az group delete -n $(AZURE_RES_GROUP) -o table --no-wait

test: $(SRC_DIR)/node_modules  ## 🎯 Unit tests with Jest 
	cd $(SRC_DIR); npm run test

test-report: $(SRC_DIR)/node_modules  ## 🤡 Unit tests with Jest & Junit output 
	rm -rf $(SRC_DIR)/test-results.xml
	cd $(SRC_DIR); npm run test-junit

test-api: $(SRC_DIR)/node_modules .EXPORT_ALL_VARIABLES  ## 🚦 Run integration API tests, server must be running 
	cd $(SRC_DIR); npm run test-postman

clean:  ## 🧹 Clean up project
	rm -rf $(SRC_DIR)/node_modules
	rm -rf $(SRC_DIR)/*.xml

# ============================================================================

$(SRC_DIR)/node_modules: $(SRC_DIR)/package.json
	cd $(SRC_DIR); npm install --silent
	touch -m $(SRC_DIR)/node_modules

$(SRC_DIR)/package.json: 
	@echo "package.json was modified"
