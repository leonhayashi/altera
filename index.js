const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const db = require('./database/database'); // Importer la base de données

// Création du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Collections pour stocker les commandes et les événements
client.commands = new Collection();
client.cooldowns = new Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// *** DÉPLACER LE CODE DU STATUT VERS L'ÉVÉNEMENT ready ***
client.once('ready', c => {
    console.log(`Prêt ! Connecté en tant que ${c.user.tag}`);

    // Fonction pour mettre à jour le statut (identique)
    const updateStatus = () => {
        db.get('SELECT COUNT(*) AS count FROM systems', (err, row) => {
            if (err) {
                console.error('Erreur lors du comptage des systèmes pour le statut:', err);
                client.user.setPresence({
                    activities: [{
                        name: 'your story',
                        type: ActivityType.Listening
                    }],
                    status: 'online'
                });
            } else {
                const systemCount = row.count;
                console.log(`Tentative de mise à jour du statut avec ${systemCount} systèmes.`);
                
                // Récupérer le nombre de membres total
                // db.get('SELECT COUNT(*) AS count FROM members', (err, memberRow) => {
                //     if (err) {
                //         console.error('Erreur lors du comptage des membres:', err);
                //     }

                //     const memberCount = memberRow ? memberRow.count : 0;
                    
                    client.user.setPresence({
                        activities: [{
                            name: `ton histoire`,
                            type: ActivityType.Listening,
                            state: `👥 ${systemCount} systèmes`, // Afficher seulement les systèmes dans le state
                            details: 'Assistant pour les systèmes pluriels',
                            timestamps: {
                                start: Date.now()
                            },
                            assets: {
                                // Assurez-vous que ces clés correspondent exactement aux noms des images uploadées dans les "Art Assets" du portail développeur Discord.
                                largeImageKey: 'altera_icon', 
                                largeText: 'Altéra - Assistant pour les systèmes',
                                smallImageKey: 'plural_icon', 
                                smallText: 'Systèmes pluriels'
                            },
                            buttons: [
                                {
                                    label: 'Inviter Altéra',
                                    url: `https://discord.com/api/oauth2/authorize?client_id=${config.CLIENT_ID}&permissions=274878221376&scope=bot%20applications.commands`
                                },
                                {
                                    label: 'Support',
                                    url: 'https://discord.gg/votre-serveur-support' // À remplacer par votre lien de serveur
                                }
                            ]
                        }],
                        status: 'online'
                    });
                // });
            }
        });
    };

    // Mettre à jour le statut au démarrage (dans l'événement ready)
    updateStatus();

    // Optionnel: Mettre à jour le statut à intervalles réguliers (décommenter si besoin)
    setInterval(updateStatus, 3600000); // 3600000 ms = 1 heure
});

// Connexion du bot
client.login(config.TOKEN)
    .catch(error => {
        console.error('Erreur lors de la connexion du bot:', error);
    }); 