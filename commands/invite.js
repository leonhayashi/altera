const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Obtenir le lien d\'invitation pour ajouter Altéra à votre serveur'),

    async execute(interaction) {
        // Créer le lien d'invitation avec les permissions nécessaires
        // 2952816640 = VIEW_CHANNEL (1024) + SEND_MESSAGES (2048) + MANAGE_MESSAGES (8192) + EMBED_LINKS (16384) + READ_MESSAGE_HISTORY (65536) + USE_EXTERNAL_EMOJIS (262144) + ADD_REACTIONS (67108864) + MANAGE_WEBHOOKS (536870912) + USE_APPLICATION_COMMANDS (2147483648)
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${config.CLIENT_ID}&permissions=2952816640&scope=bot%20applications.commands&integration_type=0`;

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('📨 Inviter Altéra')
            .setDescription('Cliquez sur le lien ci-dessous pour ajouter Altéra à votre serveur ! (Car, oui, Altéra est un bot public et open source ! 😄)')
            .addFields(
                { 
                    name: '🔗 Lien d\'invitation', 
                    value: `[Cliquez ici](${inviteLink})`, 
                    inline: false 
                },
                {
                    name: '📋 Permissions requises',
                    value: '• Voir les salons\n• Envoyer des messages\n• Gérer les messages\n• Intégrer des liens\n• Lire l\'historique des messages\n• Utiliser les emojis externes\n• Ajouter des réactions\n• Gérer les webhooks\n• Utiliser les commandes slash',
                    inline: false
                }
            )
            .setFooter({ text: 'Altéra • Pour les systèmes ✧' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
}; 