const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Charger toutes les commandes
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[ATTENTION] La commande dans ${filePath} manque de propriétés requises.`);
    }
}

// Créer une instance REST
const rest = new REST().setToken(config.TOKEN);

// Déployer les commandes
(async () => {
    try {
        console.log(`Début du déploiement de ${commands.length} commandes slash.`);

        // Déployer globalement ou dans une guilde de test
        const data = await rest.put(
            config.GUILD_ID
                ? Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID)
                : Routes.applicationCommands(config.CLIENT_ID),
            { body: commands },
        );

        console.log(`Déploiement réussi de ${data.length} commandes slash.`);
    } catch (error) {
        console.error(error);
    }
})(); 