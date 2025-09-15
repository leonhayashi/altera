const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const commands = [];
// Récupérer tous les fichiers de commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Charger les commandes
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[AVERTISSEMENT] La commande dans ${filePath} manque d'une propriété "data" ou "execute" requise.`);
    }
}

// Créer une instance REST
const rest = new REST().setToken(config.TOKEN);

// Déployer les commandes
(async () => {
    try {
        console.log(`Début du déploiement de ${commands.length} commandes (/) globalement.`);

        // Déployer les commandes globalement
        const data = await rest.put(
            Routes.applicationCommands(config.CLIENT_ID),
            { body: commands },
        );

        console.log(`Déploiement réussi de ${data.length} commandes (/) globalement.`);
    } catch (error) {
        console.error(error);
    }
})(); 