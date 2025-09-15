const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.resolve("./package.json"), "utf-8"));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide complète du bot Altéra'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('📚 Aide & Informations Altéra')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Altéra • Pour les systèmes ✧' })
            .setTimestamp();

        // À propos
        helpEmbed.addFields({
            name: '📌 À propos',
            value: `Altéra est un bot Discord dédié au soutien des systèmes pluriels/TDI, développé par ${pkg.developer} et **Ishgar.net** 🕊️.\nIl vous aide à gérer vos systèmes et à proxifier facilement vos messages.\n\n**Licence**: Distribué sous **GNU AGPL v3**, garantissant que le code reste accessible et gratuit — par le peuple, pour le peuple.`,
            inline: false
        });

        // Quickstart
        helpEmbed.addFields({
            name: '🚀 Quickstart',
            value: `Pour commencer rapidement :\n\`\`\`/system new <nom>\`\`\` → Crée un système\n\`\`\`/system edit\`\`\` → Modifie un système existant\n\`\`\`/member add <nom> <tag>\`\`\` → Ajoute un membre\n\`\`\`/switch to <nom>\`\`\` → Met un membre au front\n\`\`\`/front clear\`\`\` → Retire le membre du front\n\`\`\`[tag] message\`\`\` → Proxifie un message via le tag\n\`\`\`message\`\`\` → Envoie un message avec le membre en front (si défini)`,
            inline: false
        });

        // Liste des commandes
        helpEmbed.addFields({
            name: '📋 Commandes disponibles',
            value: `
**Système**
\`/system new\` - Crée un nouveau système
\`/system info\` - Affiche les infos du système
\`/system edit\` - Modifie un système existant

**Membres**
\`/member add\` - Ajoute un membre
\`/member list\` - Liste tous les membres
\`/member info\` - Infos d'un membre
\`/member edit\` - Modifie un membre
\`/member delete\` - Supprime un membre

**Front**
\`/front\` - Affiche le membre actuellement en front
\`/switch to <nom>\` - Met un membre au front
\`/switch clear\` - Retire le membre du front

**Proxy**
Automatique via tags ou membre en front (voir Quickstart)

**Autres**
\`/troubles\` - Infos sur les troubles dissociatifs et associés
\`/help\` - Affiche cette aide
\`/credits\` - Affiche les crédits et infos système
`,
            inline: false
        });

        // Bouton Source / GitHub
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Voir le code sur GitHub")
                .setStyle(ButtonStyle.Link)
                .setURL("https://github.com/leonhayashi/altera")
        );

        await interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: false });
    },
};
