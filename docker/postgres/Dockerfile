FROM postgres:17

# Installation des dépendances nécessaires
RUN apt-get update \
    && apt-get install -y wget gnupg2 lsb-release \
    && sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update \
    && apt-get install -y \
        postgis \
        postgresql-17-postgis-3 \
        postgresql-17-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

# Copie du script SQL d'initialisation
COPY ./docker/postgres/enable-postgis.sql /docker-entrypoint-initdb.d/

EXPOSE 5432