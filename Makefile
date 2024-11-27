# accède à la console du container
temp-sh:
	docker run --rm -ti -v ./:/app -w /app node:22-alpine /bin/sh 