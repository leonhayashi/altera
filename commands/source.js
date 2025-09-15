const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("source")
        .setDescription("Affiche le lien vers le code source du bot"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("📂 Code source d'Altéra")
            .setDescription("Vous pouvez consulter et contribuer au code source d'Altéra sur GitHub.")
            .addFields(
                { name: "Licence", value: "Distribué sous GNU AGPL v3 — le code reste accessible et gratuit." }
            )
            .setColor(0x9B59B6)
            .setFooter({ text: "Altéra • Par le peuple, pour le peuple" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Voir sur GitHub")
                .setStyle(ButtonStyle.Link)
                .setURL("https://github.com/leonhayashi/altera")
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
    },
};
