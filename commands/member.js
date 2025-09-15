const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require('@discordjs/builders');
const db = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member')
        .setDescription('Gestion des membres du système')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter un nouveau membre')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom du membre')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('tag')
                        .setDescription('Le tag du membre (utilisé pour le proxy)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('avatar')
                        .setDescription('URL de l\'avatar du membre')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description du membre')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('age')
                        .setDescription('Âge du membre')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('age_range')
                        .setDescription('Tranche d\'âge (ex: 15-17)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('birthday')
                        .setDescription('Anniversaire (ex: 2007-04-12)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('pronouns')
                        .setDescription('Pronoms (ex: il/lui, elle/iel)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Rôle dans le système (ex: protecteur·ice)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Liste tous les membres du système'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Supprimer un membre')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom du membre à supprimer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Voir les informations d\'un membre')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom du membre')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Modifier les informations d\'un membre')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom du membre à modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('tag')
                        .setDescription('Nouveau tag du membre (utilisé pour le proxy)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('avatar')
                        .setDescription('Nouvel avatar')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Nouvelle description')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('age')
                        .setDescription('Nouvel âge')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('age_range')
                        .setDescription('Nouvelle tranche d\'âge')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('birthday')
                        .setDescription('Nouvel anniversaire')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('pronouns')
                        .setDescription('Nouveaux pronoms')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Nouveau rôle')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        // Vérifier si l'utilisateur a un système
        db.get('SELECT id FROM systems WHERE user_id = ?', [userId], async (err, system) => {
            if (err) {
                console.error(err);
                return await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
            }

            if (!system) {
                return await interaction.reply({ content: 'Vous devez d\'abord créer un système avec `/system new`.', ephemeral: true });
            }

            if (subcommand === 'add') {
                const name = interaction.options.getString('name');
                const avatar = interaction.options.getString('avatar');
                const tag = interaction.options.getString('tag');
                const description = interaction.options.getString('description');
                const age = interaction.options.getInteger('age');
                const age_range = interaction.options.getString('age_range');
                const birthday = interaction.options.getString('birthday');
                const pronouns = interaction.options.getString('pronouns');
                const role = interaction.options.getString('role');

                // Vérifier si le tag est déjà utilisé
                db.get('SELECT id FROM members WHERE system_id = ? AND tag = ? COLLATE NOCASE', [system.id, tag], async (err, existingMember) => {
                    if (err) {
                        console.error(err);
                        // Utiliser un embed d'erreur stylé
                         const errorEmbed = new EmbedBuilder()
                            .setColor(0xE74C3C) // Rouge pour erreur
                            .setTitle('❌ Erreur base de données')
                            .setDescription('Une erreur est survenue lors de la vérification du tag.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (existingMember) {
                        // Utiliser un embed d'avertissement stylé
                        const warningEmbed = new EmbedBuilder()
                            .setColor(0xF1C40F) // Jaune pour avertissement
                            .setTitle('⚠️ Tag déjà utilisé')
                            .setDescription('Ce tag est déjà utilisé par un autre membre de votre système.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [warningEmbed], ephemeral: true });
                    }

                    // Ajouter le nouveau membre
                    db.run('INSERT INTO members (system_id, name, avatar_url, tag, description, age, age_range, birthday, pronouns, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [system.id, name, avatar, tag, description, age, age_range, birthday, pronouns, role],
                        async function(err) {
                            if (err) {
                                console.error(err);
                                // Utiliser un embed d'erreur stylé
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(0xE74C3C) // Rouge pour erreur
                                    .setTitle('❌ Erreur base de données')
                                    .setDescription('Une erreur est survenue lors de l\'ajout du membre.')
                                    .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                    .setTimestamp();
                                return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                            }

                            // Utiliser un embed de succès stylé
                            const successEmbed = new EmbedBuilder()
                                .setColor(0x2ECC71) // Vert pour succès
                                .setTitle('✅ Membre ajouté')
                                .setDescription(`Membre "${name}" ajouté avec succès !`) // Ajouter le nom du membre
                                .addFields(
                                    { name: 'Tag', value: tag, inline: true },
                                )
                                .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                .setTimestamp();
                             // Ajouter l'avatar si présent
                             if (avatar) {
                                 successEmbed.setThumbnail(avatar);
                             }
                            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                        });
                });
            }

            else if (subcommand === 'list') {
                const userId = interaction.user.id;
                db.get('SELECT id, name FROM systems WHERE user_id = ?', [userId], async (err, system) => {
                    if (err) {
                        console.error(err);
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xE74C3C)
                            .setTitle('❌ Erreur base de données')
                            .setDescription('Une erreur est survenue lors de la récupération de votre système.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (!system) {
                        const infoEmbed = new EmbedBuilder()
                            .setColor(0x3498DB)
                            .setTitle('ℹ️ Aucun système')
                            .setDescription('Vous n\'avez pas encore de système. Créez-en un avec `/system new`.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
                    }

                    db.all('SELECT * FROM members WHERE system_id = ? ORDER BY name COLLATE NOCASE', [system.id], async (err, members) => {
                        if (err) {
                            console.error(err);
                            const errorEmbed = new EmbedBuilder()
                                .setColor(0xE74C3C)
                                .setTitle('❌ Erreur base de données')
                                .setDescription('Une erreur est survenue lors de la récupération des membres.')
                                .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                .setTimestamp();
                            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                        }

                        if (members.length === 0) {
                            const infoEmbed = new EmbedBuilder()
                                .setColor(0x3498DB)
                                .setTitle('ℹ️ Aucun membre')
                                .setDescription('Vous n\'avez pas encore de membres dans votre système.')
                                .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                .setTimestamp();
                            return await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
                        }

                        const membersPerPage = 10; // Nombre de membres par page
                        const totalPages = Math.ceil(members.length / membersPerPage);
                        let currentPage = 0; // Page actuelle (index 0)

                        // Fonction pour créer l'embed de la page
                        const createPageEmbed = (pageIndex) => {
                            const start = pageIndex * membersPerPage;
                            const end = start + membersPerPage;
                            const currentMembers = members.slice(start, end);

                            const pageEmbed = new EmbedBuilder()
                                .setColor(0x9B59B6)
                                .setTitle(`👥 Liste des membres de ${system.name} (Page ${pageIndex + 1}/${totalPages})`)
                                .setDescription('Voici les membres de votre système.')
                                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                                .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                                .setTimestamp();

                            currentMembers.forEach(member => {
                                pageEmbed.addFields({
                                    name: `${member.name} ${member.tag ? `[${member.tag}]` : ''}`, // Nom et tag
                                    value: `Rôle: ${member.role || 'Non défini'}`, // Rôle
                                    inline: true // Afficher sur la même ligne si possible
                                });
                            });

                            // Ajouter un champ vide pour l'alignement si nécessaire
                            if (currentMembers.length % 3 === 2) {
                                pageEmbed.addFields({ name: '\u200B', value: '\u200B', inline: true });
                            }

                            return pageEmbed;
                        };

                        // Créer les boutons
                        const createActionRow = (pageIndex) => {
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('prev_page')
                                        .setLabel('◀️ Précédent')
                                        .setStyle('Primary')
                                        .setDisabled(pageIndex === 0), // Désactiver si c'est la première page
                                    new ButtonBuilder()
                                        .setCustomId('next_page')
                                        .setLabel('Suivant ▶️')
                                        .setStyle('Primary')
                                        .setDisabled(pageIndex === totalPages - 1), // Désactiver si c'est la dernière page
                                );
                            return row;
                        };

                        // Envoyer le premier message avec la première page et les boutons
                        const initialEmbed = createPageEmbed(currentPage);
                        const initialRow = createActionRow(currentPage);

                        const replyMessage = await interaction.reply({
                            embeds: [initialEmbed],
                            components: [initialRow],
                            ephemeral: false
                        });

                        // Créer un collecteur de composants pour les boutons
                        const filter = i => ['prev_page', 'next_page'].includes(i.customId) && i.user.id === interaction.user.id;
                        const collector = replyMessage.createMessageComponentCollector({ filter, time: 300000 }); // Collecter pendant 5 minutes

                        collector.on('collect', async i => {
                            if (i.customId === 'prev_page') {
                                currentPage--;
                            } else if (i.customId === 'next_page') {
                                currentPage++;
                            }

                            // Mettre à jour l'embed et les boutons pour la nouvelle page
                            const updatedEmbed = createPageEmbed(currentPage);
                            const updatedRow = createActionRow(currentPage);

                            await i.update({ embeds: [updatedEmbed], components: [updatedRow] });
                        });

                        collector.on('end', collected => {
                            // Désactiver les boutons à la fin de la collecte (optionnel)
                            const disabledRow = createActionRow(currentPage);
                            replyMessage.edit({ components: [disabledRow] }).catch(console.error);
                        });

                    });
                });
            }

            else if (subcommand === 'delete') {
                const name = interaction.options.getString('name');

                db.run('DELETE FROM members WHERE system_id = ? AND name = ? COLLATE NOCASE', [system.id, name], async function(err) {
                    if (err) {
                        console.error(err);
                        // Utiliser un embed d'erreur stylé
                         const errorEmbed = new EmbedBuilder()
                            .setColor(0xE74C3C) // Rouge pour erreur
                            .setTitle('❌ Erreur base de données')
                            .setDescription('Une erreur est survenue lors de la suppression du membre.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    if (this.changes === 0) {
                        // Utiliser un embed d'avertissement stylé
                        const warningEmbed = new EmbedBuilder()
                            .setColor(0xF1C40F) // Jaune pour avertissement
                            .setTitle('⚠️ Membre introuvable')
                            .setDescription('Aucun membre trouvé avec ce nom dans votre système.')
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        return await interaction.reply({ embeds: [warningEmbed], ephemeral: true });
                    }

                    // Utiliser un embed de succès stylé
                    const successEmbed = new EmbedBuilder()
                        .setColor(0x2ECC71) // Vert pour succès
                        .setTitle('✅ Membre supprimé')
                        .setDescription(`Membre "${name}" supprimé avec succès.`) // Ajouter le nom du membre supprimé
                        .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                        .setTimestamp();
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                });
            }

            else if (subcommand === 'info') {
                const name = interaction.options.getString('name');

                db.get('SELECT * FROM members WHERE system_id = ? AND name = ?', [system.id, name], async (err, member) => {
                    if (err) {
                        console.error(err);
                        return await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
                    }

                    if (!member) {
                        return await interaction.reply({ content: 'Aucun membre trouvé avec ce nom.', ephemeral: true });
                    }

                    function champ(val) { return val ? val.toString() : 'Non défini'; }

                    const embed = new EmbedBuilder()
                        .setColor(0x9B59B6)
                        .setTitle(`🧍 Info sur ${member.name}`)
                        .setThumbnail(member.avatar_url || interaction.user.displayAvatarURL())
                        .addFields(
                            { name: '📖 Description', value: champ(member.description) },
                            { name: '🎂 Âge', value: member.age ? member.age + ' ans' : (champ(member.age_range)), inline: true },
                            { name: '🏷️ Tag de proxy', value: champ(member.tag), inline: true },
                            { name: '🎯 Rôle', value: champ(member.role), inline: true },
                            { name: '📅 Anniversaire', value: champ(member.birthday), inline: true },
                            { name: '🗣️ Pronoms', value: champ(member.pronouns), inline: true },
                            { name: '⏱️ Ajouté le', value: new Date(member.created_at).toLocaleDateString(), inline: true },
                            { name: '🆔 ID', value: member.id.toString(), inline: true }
                        )
                        .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                });
            }

            else if (subcommand === 'edit') {
                const name = interaction.options.getString('name');
                const avatar = interaction.options.getString('avatar');
                const description = interaction.options.getString('description');
                const age = interaction.options.getInteger('age');
                const age_range = interaction.options.getString('age_range');
                const birthday = interaction.options.getString('birthday');
                const pronouns = interaction.options.getString('pronouns');
                const role = interaction.options.getString('role');
                const tag = interaction.options.getString('tag');

                // Construire la requête de mise à jour dynamiquement en fonction des champs fournis
                let updateFields = [];
                let params = [];

                if (tag !== null) {
                    updateFields.push('tag = ?');
                    params.push(tag);
                }
                if (avatar !== null) {
                    updateFields.push('avatar_url = ?');
                    params.push(avatar);
                }
                if (description !== null) {
                    updateFields.push('description = ?');
                    params.push(description);
                }
                if (age !== null) {
                    updateFields.push('age = ?');
                    params.push(age);
                }
                if (age_range !== null) {
                    updateFields.push('age_range = ?');
                    params.push(age_range);
                }
                if (birthday !== null) {
                    updateFields.push('birthday = ?');
                    params.push(birthday);
                }
                if (pronouns !== null) {
                    updateFields.push('pronouns = ?');
                    params.push(pronouns);
                }
                if (role !== null) {
                    updateFields.push('role = ?');
                    params.push(role);
                }

                if (updateFields.length === 0) {
                    return await interaction.reply({ content: 'Veuillez fournir au moins un champ à modifier.', ephemeral: true });
                }

                const query = `UPDATE members SET ${updateFields.join(', ')} WHERE system_id = ? AND name = ?`;
                params.push(system.id);
                params.push(name);

                db.run(query,
                    params,
                    async function(err) {
                        if (err) {
                            console.error(err);
                            return await interaction.reply({ content: 'Une erreur est survenue lors de la mise à jour du membre.', ephemeral: true });
                        }

                        if (this.changes === 0) {
                            return await interaction.reply({ content: 'Aucun membre trouvé avec ce nom ou aucun changement effectué.', ephemeral: true });
                        }

                        await interaction.reply({ content: `Informations de "${name}" mises à jour avec succès.`, ephemeral: true });
                    });
            }
        });
    },
}; 