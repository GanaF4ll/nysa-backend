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
