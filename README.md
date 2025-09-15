# Altéra - Bot Discord pour Systèmes Pluriels

![License](https://img.shields.io/badge/License-AGPLv3-blue.svg)
![Version](https://img.shields.io/badge/Version-2.3.8-purple)
![Codename](https://img.shields.io/badge/Codename-noche-black)
![Platform](https://img.shields.io/badge/Platform-Discord-blueviolet)
[![Invite Bot](https://img.shields.io/badge/Invite%20Altéra-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1413781657458053191&scope=bot%20applications.commands&permissions=8)

Altéra est un bot Discord dédié au soutien des systèmes pluriels/TDI, permettant de gérer les membres de votre système et de proxifier facilement les messages.  
Le bot est **libre et gratuit**, distribué sous licence **GNU AGPL v3**, garantissant que le code reste accessible à tous — **par le peuple, pour le peuple**.  

✨ Altéra fait partie du **Hayashi BotSuit 林BS (林ボットスイート)**.

---

## 📑 Table des matières

1. [Installation](#-installation)  
2. [Commandes principales](#-commandes-principales)  
3. [Quickstart](#-quickstart)  
4. [Screenshots / Démonstration](#-screenshots--démonstration)  
5. [Licence](#-licence)  
6. [Crédits](#-crédits)  
7. [Code source](#-code-source)
8. [Bot prêt à l'emploi](#-bot-universel)


---

## 🚀 Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/leonhayashi/altera.git
````

2. Installez les dépendances :

```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec votre token Discord, votre clientID et serverID et completez le `config.js` :

```
# Token du bot Discord
TOKEN=VotreTokenDeBot

# ID de l'application (Client ID)
CLIENT_ID=VotreClientID

# ID du serveur de test (optionnel)
GUILD_ID=VotreServerID
```

4. Démarrez le bot :

```bash
npm start
```

---

## 📝 Commandes principales

### Système

* `/system new <nom>` - Crée un nouveau système
* `/system info` - Affiche les informations du système
* `/system edit` - Modifie les informations du système

### Membres

* `/member add <nom> <tag>` - Ajoute un membre
* `/member list` - Liste tous les membres
* `/member info` - Affiche les infos d’un membre
* `/member edit` - Modifie un membre
* `/member delete` - Supprime un membre

### Front

* `/front` - Affiche le membre actuellement en front
* `/switch to <nom>` - Met un membre au front
* `/switch clear` - Retire le membre du front

### Proxy

* Automatique via tags ou membre en front (voir Quickstart)

### Autres

* `/troubles` - Infos sur les troubles dissociatifs et associés
* `/help` - Affiche l’aide complète
* `/credits` - Affiche les crédits et infos système
* `/source` - Lien vers le code source sur GitHub

---

## 🚀 Quickstart

Pour envoyer un message proxifié :

* `[tag] Votre message` → Proxifie via le tag
* `Votre message` → Si un membre est en front, le message est envoyé avec son nom/avatar

---

## 🖼 Screenshots / Démonstration

> Ici vous pouvez ajouter des images ou GIFs montrant le bot en action, par exemple :

![Altéra en action](./screenshots/front-example.gif)
*Exemple de message proxifié par Altéra.*

![Altéra commandes](./screenshots/commands-example.gif)
*Démonstration de l’utilisation des commandes principales.*

> Remplacez les chemins par vos fichiers d’images ou GIFs dans le repo.

---

## 📜 Licence

Altera est distribué sous **GNU AGPL v3**.

* ✅ Vous pouvez utiliser, modifier et partager le code librement
* ✅ Toute modification ou dérivé doit être redistribué sous la même licence
* ✅ Même si le bot est hébergé comme service, le code source modifié doit rester accessible

✨ **Altéra restera toujours gratuit et accessible — par le peuple, pour le peuple.**

---

## 💡 Crédits

Développé par **Léon Hayashi (林 怜音)** et **Ishgar.net** 🕊️
Merci à toutes les personnes pluriels et allié·es pour leur soutien 💜

---

## 📂 Code source

Vous pouvez consulter et contribuer au code sur GitHub :
[Voir le dépôt GitHub](https://github.com/leonhayashi/altera)

---

## 📂 Bot Universel

Nous hébergeons le bot prêt à l'emploi directement, voici le lien pour l'ajouter à votre serveur ! :
[Ajouter Altera](https://discord.com/oauth2/authorize?client_id=1413781657458053191&permissions=8&integration_type=0&scope=bot)


```
