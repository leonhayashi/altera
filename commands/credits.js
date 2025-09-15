const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const os = require("os");
const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(fs.readFileSync(path.resolve("./package.json"), "utf-8"));
const versionName = pkg.versionName || "Stable";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Affiche les crédits, infos système et licence du bot."),

  async execute(interaction) {
    const uptime = process.uptime();
    const uptimeStr = [
      Math.floor(uptime / 3600),
      Math.floor((uptime % 3600) / 60),
      Math.floor(uptime % 60),
    ]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");

    const formatDate = (d) => {
      if (!d) return "N/A";
      const [year, month, day] = d.split("-");
      return `${day}/${month}/${year}`;
    };

    const embed = new EmbedBuilder()
      .setTitle("✨ Crédits & Infos du bot Altéra")
      .setColor(0x9B59B6)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription(
        `Altéra est un bot Discord dédié au soutien des systèmes pluriels/TDI 💭.\n
**Mission**: Aider les personnes pluriels à mieux s’intégrer dans les communautés Discord.\n
**Licence**: Distribué sous **GNU AGPL v3** — le code reste accessible et gratuit.\n
**Développement & Soutien**: Léon Hayashi (林 怜音) et Ishgar.net 🕊️`
      )
      .addFields(
        { name: "Nom du bot", value: pkg.name, inline: true },
        { name: "Version", value: pkg.version, inline: true },
        { name: "Codename", value: versionName, inline: true },
        { name: "Uptime", value: uptimeStr, inline: true },
        { name: "Créé le", value: formatDate(pkg.creationDate), inline: true },
        { name: "Dernière mise à jour", value: formatDate(pkg.lastUpdate), inline: true },
        { name: "Description", value: pkg.description, inline: true },
        { name: "Développeur", value: pkg.developer, inline: true },
        { name: "OS", value: `${os.type()} ${os.release()} (${os.arch()})`, inline: true },
        { name: "CPU", value: os.cpus()[0].model, inline: false }
      )
      .setFooter({ text: `Merci d'utiliser Altéra !` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Voir le code sur GitHub")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/votre-compte/altera") // Remplace par ton GitHub
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
