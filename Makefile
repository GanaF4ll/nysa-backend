# accède à la console du container
temp-sh:
	docker run --rm -ti -v ./:/app -w /app node:22-alpine /bin/sh 

fix-permissions:
	chown -R $(shell id -u):$(shell id -g) .


nest-sh:
	docker compose exec nest-api /bin/sh