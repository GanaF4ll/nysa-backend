# websocket-feature 14/12/24

- Suppression relation model Conversation & Event: erreur de conception, les conversations privées ne sont pas liées à un event
- colonne sender_id dans la table Message

# auth-refacto 03/01/25

- suppression de la table Auth
- la route /register renvoie l'access_token directement
- update des routes user pour ne plus avoir à ajouter l'id en param dans les routes patch & delete
- les routes users findById & findByEmail sont protégées

# OAuth 05/05/25

- OAuth Google
- ajout de la colonne Provider dans la table User pour savoir d'où un user a créer son compte

# fixes 12/01/25

- suppression de la colonne city dans la table User
- better error handling
- ajout colonne start_time & end_time à la table Event
- suppression colonne date dans la table Event
- general API Response type

# postgis-feature 12/01/25

- new dockerfile for the db
- postgis integration
- docker compose changes
- event filters in eventService.findAll()

# fixes 13/01/2025

- fix verifyToken, deleted user.email
- new ResponseType interface for general API response

# S3 15/01/25

- intégration du S3
- intégration du service AWS dans le imageService
- les events peuvent être crée avec leurs images
- event.findAll() retour la 1ere image de l'event

# dev 20/01/25

- event.findAll() retourne des infos du user
- upgrade sur les GET d'event
