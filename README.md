# UPSYLOW Bot Ultra

Bot Discord complet pour l'association UPSYLOW.

## Fonctions incluses

- `/setup` : crée la structure complète du serveur, rôles, salons, permissions et panels
- `/panel` : recrée les panels principaux sans recréer tout le serveur
- `/event` : crée un message de présence pour un événement
- `/help-upsylow` : affiche l'aide admin
- Règlement avec bouton d'acceptation
- Rôles musicaux avec boutons toggle
- Tickets privés : Contact, Booking DJ, Safer
- Formulaire bénévole intégré avec rôle souhaité
- Validation staff : accepter / refuser / à revoir
- Attribution automatique des rôles bénévoles
- Formulaire DJ intégré
- Logs staff
- Anti-doublons simples
- Compatible Railway / Render / VPS

## Installation locale

```bash
npm install
npm run deploy
npm start
```

## Variables d'environnement

Copie `.env.example` en `.env`, puis remplis :

```env
DISCORD_TOKEN=ton_token_discord
CLIENT_ID=id_application_bot
GUILD_ID=id_du_serveur
```

## Mise en ligne Railway

1. Mets le projet sur GitHub
2. Railway → New Project → Deploy from GitHub
3. Ajoute les variables :
   - DISCORD_TOKEN
   - CLIENT_ID
   - GUILD_ID
4. Start command :
```bash
npm start
```

## Important

Ne publie jamais ton fichier `.env`.
Si ton token Discord a été affiché en capture ou partagé, reset-le dans Discord Developer Portal.
