FROM postgres:17

# Installation des dépendances nécessaires
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-17-postgis-3 \
        postgresql-17-postgis-3-scripts \
        postgis \
    && rm -rf /var/lib/apt/lists/*

# Ajout d'un script pour activer PostGIS dans la base de données
COPY ./docker/postgres/enable-postgis.sql /docker-entrypoint-initdb.d/

EXPOSE 5432