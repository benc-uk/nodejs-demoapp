IMAGE_REG ?= ghcr.io
IMAGE_REPO ?= benc-uk/nodejs-demoapp
IMAGE_TAG ?= latest

SRC_DIR := src

DEPLOY_RES_GROUP ?= temp-nodeapp
DEPLOY_REGION ?= uksouth
DEPLOY_SITE_NAME ?= demoapp6731

.PHONY: help lint lint-fix image push run deploy undeploy .EXPORT_ALL_VARIABLES
.DEFAULT_GOAL := help

help:  ## This help message 😁
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: $(SRC_DIR)/node_modules  ## Lint & format, will not fix but sets exit code on error 🔎
	cd $(SRC_DIR); npm run lint

lint-fix: $(SRC_DIR)/node_modules  ## Lint & format, will try to fix errors and modify code 📜
	cd $(SRC_DIR); npm run lint-fix

image:  ## Build container image from Dockerfile 🔨
	docker build . --file build/Dockerfile \
	--tag $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

push:  ## Push container image to registry 📤
	docker push $(IMAGE_REG)/$(IMAGE_REPO):$(IMAGE_TAG)

run: $(SRC_DIR)/node_modules .EXPORT_ALL_VARIABLES  ## Run locally using Node.js 🏃‍
	cd $(SRC_DIR); npm run watch

deploy: .EXPORT_ALL_VARIABLES  ## Deploy to Azure Web App 🚀
	az group create -n $(DEPLOY_RES_GROUP) -l $(DEPLOY_REGION) -o table
	az deployment group create --template-file deploy/webapp.bicep -g $(DEPLOY_RES_GROUP) -p webappName=$(DEPLOY_SITE_NAME)

undeploy: .EXPORT_ALL_VARIABLES  ## Remove from Azure 💀
	@echo "### WARNING! Going to delete $(DEPLOY_RES_GROUP) 😲"
	az group delete -n $(DEPLOY_RES_GROUP) -o table --no-wait

test: $(SRC_DIR)/node_modules .EXPORT_ALL_VARIABLES  ## Unit tests with Jest 🤡
	cd $(SRC_DIR); npm run test

test-report: $(SRC_DIR)/node_modules .EXPORT_ALL_VARIABLES  ## Unit tests with Jest & Junit output 🤡
	rm -rf $(SRC_DIR)/test-results.xml
	cd $(SRC_DIR); npm run test-junit

test-api: $(SRC_DIR)/node_modules .EXPORT_ALL_VARIABLES  ## Run integration API tests, server must be running 🚦
	rm -rf $(SRC_DIR)/api-test-results.xml
	cd $(SRC_DIR); npm run test-postman
	cat $(SRC_DIR)/api-test-resultsS.xml

# ============================================================================

$(SRC_DIR)/node_modules: $(SRC_DIR)/package.json
	cd $(SRC_DIR); npm install --silent
	touch -m $(SRC_DIR)/node_modules

$(SRC_DIR)/package.json: 
	@echo "package.json was modified"
