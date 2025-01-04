# websocket-feature 14/12/24

- Suppression relation model Conversation & Event: erreur de conception, les conversations privées ne sont pas liées à un event
- colonne sender_id dans la table Message

# auth-refacto

- suppression de la table Auth
- la route /register renvoie l'access_token directement
- update des routes user pour ne plus avoir à ajouter l'id en param dans les routes patch & delete
