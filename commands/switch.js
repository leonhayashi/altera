const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database');
const stringSimilarity = require('string-similarity');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('switch')
        .setDescription('Gestion du front')
        .addSubcommand(subcommand =>
            subcommand
                .setName('to')
                .setDescription('Définir qui est en front')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom du membre qui passe en front')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Enlever le membre actuellement en front')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // Vérifier si l'utilisateur a un système
        db.get('SELECT id FROM systems WHERE user_id = ?', [userId], async (err, system) => {
            if (err) {
                console.error(err);
                // Utiliser un embed d'erreur stylé
                const errorEmbed = new EmbedBuilder()
                    .setColor('#E74C3C') // Rouge pour erreur
                    .setTitle('❌ Erreur système')
                    .setDescription('Une erreur est survenue lors de la recherche de votre système.')
                    .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                    .setTimestamp();
                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (!system) {
                // Utiliser un embed d'information stylé
                const infoEmbed = new EmbedBuilder()
                    .setColor('#3498DB') // Bleu pour info
                    .setTitle('ℹ️ Pas de système')
                    .setDescription('Vous devez d\'abord créer un système avec `/system new`.')
                    .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                    .setTimestamp();
                return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
            }

            if (subcommand === 'to') {
                const searchName = interaction.options.getString('name').toLowerCase();

                // Récupérer tous les membres du système
                db.all('SELECT * FROM members WHERE system_id = ?', [system.id], async (err, members) => {
                    if (err) {
                        console.error(err);
                        // Utiliser un embed d'erreur stylé
                         const errorEmbed = new EmbedBuilder()
                            .setColor('#E74C3C') // Rouge pour erreur
                            .setTitle('❌ Erreur base de données')
                            .setDescription('Une erreur est survenue lors de la récupération des membres.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (members.length === 0) {
                        // Utiliser un embed d'information stylé
                        const infoEmbed = new EmbedBuilder()
                            .setColor('#3498DB') // Bleu pour info
                            .setTitle('ℹ️ Aucun membre')
                            .setDescription('Vous n\'avez pas encore de membres dans votre système.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
                    }

                    // Recherche exacte (insensible à la casse)
                    let member = members.find(m => m.name.toLowerCase() === searchName);

                    // Si pas de correspondance exacte, utiliser la recherche floue
                    if (!member) {
                        const matches = stringSimilarity.findBestMatch(
                            searchName,
                            members.map(m => m.name.toLowerCase())
                        );

                        // Si la meilleure correspondance a un score supérieur à 0.6
                        if (matches.bestMatch.rating > 0.6) {
                            member = members[matches.bestMatchIndex];
                        }
                    }

                    if (!member) {
                        // Utiliser un embed d'avertissement stylé
                        const warningEmbed = new EmbedBuilder()
                            .setColor('#F1C40F') // Jaune pour avertissement
                            .setTitle('⚠️ Membre introuvable')
                            .setDescription('Aucun membre trouvé avec ce nom. Vérifiez l\'orthographe ou essayez un nom similaire.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [warningEmbed], ephemeral: true });
                    }

                    // Enregistrer le switch
                    db.run('INSERT INTO switches (system_id, member_id) VALUES (?, ?)',
                        [system.id, member.id],
                        async function(err) {
                            if (err) {
                                console.error(err);
                                // Utiliser un embed d'erreur stylé
                                const errorEmbed = new EmbedBuilder()
                                    .setColor('#E74C3C') // Rouge pour erreur
                                    .setTitle('❌ Erreur base de données')
                                    .setDescription('Une erreur est survenue lors de l\'enregistrement du switch.')
                                    .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                    .setTimestamp();
                                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                            }

                            // Utiliser un embed de succès stylé
                            const successEmbed = new EmbedBuilder()
                                .setColor('#2ECC71') // Vert pour succès
                                .setTitle('✅ Switch réussi')
                                .setDescription(`${member.name} est maintenant en front !`)
                                .setThumbnail(member.avatar_url || interaction.user.displayAvatarURL({ dynamic: true })) // Ajouter l'avatar
                                .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                .setTimestamp();
                            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                        });
                });
            }

            else if (subcommand === 'clear') {
                db.run('DELETE FROM switches WHERE system_id = ?', [system.id], async function(err) {
                    if (err) {
                        console.error(err);
                        // Utiliser un embed d'erreur stylé
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#E74C3C') // Rouge pour erreur
                            .setTitle('❌ Erreur base de données')
                            .setDescription('Une erreur est survenue lors de la suppression du front.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (this.changes === 0) {
                        // Utiliser un embed d'information stylé
                        const infoEmbed = new EmbedBuilder()
                            .setColor('#3498DB') // Bleu pour info
                            .setTitle('ℹ️ Aucun front actif')
                            .setDescription('Aucun membre n\'était en front à retirer.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
                    }

                    // Utiliser un embed de succès stylé
                    const successEmbed = new EmbedBuilder()
                        .setColor('#2ECC71') // Vert pour succès
                        .setTitle('✅ Front retiré')
                        .setDescription('Le membre en front a été retiré avec succès.')
                        .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                        .setTimestamp();
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                });
            }
        });
    },
}; 