PORT ?= 6969

# Build the unified Docker image from the root context
build:
	docker build -t api_videocontrol .

# Run the unified Docker container mapping custom PORT
run:
	docker run -d --name api_videocontrol-backend -p $(PORT):$(PORT) -e PORT=$(PORT) api_videocontrol

# Run local development (installs packages and runs backend node server)
dev:
	cd backend && npm install && PORT=$(PORT) npm start

# Stop and clean the docker containers
clean:
	docker stop api_videocontrol-backend || true
	docker rm api_videocontrol-backend || true
