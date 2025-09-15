const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('front')
        .setDescription('Affiche le membre actuellement en front.'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Rechercher le système de l'utilisateur
        db.get('SELECT id FROM systems WHERE user_id = ?', [userId], async (err, system) => {
            if (err) {
                console.error(err);
                return await interaction.reply({ content: 'Une erreur est survenue lors de la recherche de votre système.', ephemeral: true });
            }

            if (!system) {
                return await interaction.reply({ content: 'Vous n\'avez pas encore de système enregistré.', ephemeral: true });
            }

            // Rechercher le membre actuellement en front
            db.get('SELECT m.name, m.avatar_url FROM switches s JOIN members m ON s.member_id = m.id WHERE s.system_id = ? ORDER BY s.switched_at DESC LIMIT 1', [system.id], async (err, frontMember) => {
                if (err) {
                    console.error(err);
                    return await interaction.reply({ content: 'Une erreur est survenue lors de la recherche du membre en front.', ephemeral: true });
                }

                if (!frontMember) {
                    const embed = new EmbedBuilder()
                        .setColor(0x9B59B6)
                        .setTitle('👑 Aucun membre en front actuellement')
                        .setDescription('Utilisez `/switch <nom_du_membre>` pour définir qui est en front.')
                        .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                        .setTimestamp();
                    return await interaction.reply({ embeds: [embed] });
                }

                const embed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle(`👑 ${frontMember.name} est actuellement en front`)
                    .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                    .setTimestamp();

                if (frontMember.avatar_url) {
                    embed.setThumbnail(frontMember.avatar_url);
                }

                await interaction.reply({ embeds: [embed] });
            });
        });
    },
}; 