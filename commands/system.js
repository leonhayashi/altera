const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const db = require('../database/database');

const AVAILABLE_SYMBOLS = ['⁕', '★', '✦', '☀', '✧', '✯', '✰', '❈', '✶', '🌙', '🜁', '⋆'];

// Fonction pour vérifier si le symbole est valide (un seul caractère Unicode ou emoji)
function isValidSymbol(symbol) {
    // Vérifier si le symbole est vide
    if (!symbol) return false;

    // Vérifier si c'est un emoji (contient des caractères spéciaux)
    const emojiRegex = /[\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;
    if (emojiRegex.test(symbol)) {
        // Vérifier que c'est un seul emoji
        return symbol.length === 2 || (symbol.length === 1 && emojiRegex.test(symbol));
    }

    // Vérifier si c'est un caractère Unicode simple
    return symbol.length === 1;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('system')
        .setDescription('Gestion du système')
        .addSubcommand(subcommand =>
            subcommand
                .setName('new')
                .setDescription('Créer un nouveau système')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Le nom de votre système')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('symbol')
                        .setDescription('Le symbole décoratif pour votre système (choisissez parmi la liste ou entrez votre propre symbole)')
                        .setRequired(false)
                        .addChoices(
                            { name: '⁕', value: '⁕' },
                            { name: '★', value: '★' },
                            { name: '✦', value: '✦' },
                            { name: '☀', value: '☀' },
                            { name: '✧', value: '✧' },
                            { name: '✯', value: '✯' },
                            { name: '✰', value: '✰' },
                            { name: '❈', value: '❈' },
                            { name: '✶', value: '✶' },
                            { name: '🌙', value: '🌙' },
                            { name: '🜁', value: '🜁' },
                            { name: '⋆', value: '⋆' },
                            { name: 'Personnalisé', value: 'custom' }
                        ))
                .addStringOption(option =>
                    option.setName('custom_symbol')
                        .setDescription('Votre symbole personnalisé (utilisez cette option si vous avez choisi "Personnalisé")')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Voir les informations de votre système'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Modifier les informations de votre système')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nouveau nom du système')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('symbol')
                        .setDescription('Nouveau symbole décoratif pour votre système')
                        .setRequired(false)
                        .addChoices(
                            { name: '⁕', value: '⁕' },
                            { name: '★', value: '★' },
                            { name: '✦', value: '✦' },
                            { name: '☀', value: '☀' },
                            { name: '✧', value: '✧' },
                            { name: '✯', value: '✯' },
                            { name: '✰', value: '✰' },
                            { name: '❈', value: '❈' },
                            { name: '✶', value: '✶' },
                            { name: '🌙', value: '🌙' },
                            { name: '🜁', value: '🜁' },
                            { name: '⋆', value: '⋆' },
                            { name: 'Personnalisé', value: 'custom' }
                        ))
                .addStringOption(option =>
                    option.setName('custom_symbol')
                        .setDescription('Votre symbole personnalisé (utilisez cette option si vous avez choisi "Personnalisé")')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description du système')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('timezone')
                        .setDescription('Fuseau horaire (ex: Europe/Paris)')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'new') {
            const name = interaction.options.getString('name');
            let symbol = interaction.options.getString('symbol') || '⁕';
            const customSymbol = interaction.options.getString('custom_symbol');

            // Si l'utilisateur a choisi un symbole personnalisé
            if (symbol === 'custom') {
                if (!customSymbol) {
                    return await interaction.reply({ 
                        content: 'Vous devez spécifier un symbole personnalisé.', 
                        ephemeral: true 
                    });
                }
                if (!isValidSymbol(customSymbol)) {
                    return await interaction.reply({ 
                        content: 'Le symbole doit être un seul caractère Unicode ou un emoji.', 
                        ephemeral: true 
                    });
                }
                symbol = customSymbol;
            }

            const userId = interaction.user.id;

            // Vérifier si l'utilisateur a déjà un système
            db.get('SELECT id FROM systems WHERE user_id = ?', [userId], async (err, row) => {
                if (err) {
                    console.error(err);
                    return await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
                }

                if (row) {
                    return await interaction.reply({ content: 'Vous avez déjà un système enregistré.', ephemeral: true });
                }

                // Créer le nouveau système
                db.run('INSERT INTO systems (user_id, name, symbol) VALUES (?, ?, ?)', 
                    [userId, name, symbol], 
                    async function(err) {
                        if (err) {
                            console.error(err);
                            return await interaction.reply({ content: 'Une erreur est survenue lors de la création du système.', ephemeral: true });
                        }

                        // Utiliser un embed de succès stylé (public)
                        const successEmbed = new EmbedBuilder()
                            .setColor(0x2ECC71) // Vert pour succès
                            .setTitle('✅ Système créé !')
                            .setDescription(`Votre système "${name}" a été créé avec succès.`) // Nom du système
                            .addFields(
                                { name: 'Nom', value: name, inline: true },
                                { name: 'Symbole', value: symbol, inline: true }
                            )
                            .setFooter({ text: 'Altéra • Pour les systèmes ✧' })
                            .setTimestamp();

                        await interaction.reply({ embeds: [successEmbed], ephemeral: false }); // Public
                    });
            });
        }

        else if (subcommand === 'info') {
            const userId = interaction.user.id;

            db.get('SELECT * FROM systems WHERE user_id = ?', [userId], async (err, system) => {
                if (err) {
                    console.error(err);
                    return await interaction.reply({ content: 'Une erreur est survenue.' });
                }

                if (!system) {
                    return await interaction.reply({ content: 'Vous n\'avez pas encore de système enregistré.' });
                }

                // Récupérer le nombre de membres
                db.get('SELECT COUNT(*) as count FROM members WHERE system_id = ?', [system.id], async (err, result) => {
                    if (err) {
                        console.error(err);
                        return await interaction.reply({ content: 'Une erreur est survenue.' });
                    }

                    // Récupérer le membre en front
                    db.get('SELECT m.name, m.avatar_url FROM switches s JOIN members m ON s.member_id = m.id WHERE s.system_id = ? ORDER BY s.switched_at DESC LIMIT 1', [system.id], async (err, front) => {
                        function champ(val) { return val ? val.toString() : 'Non défini'; }
                        const embed = new EmbedBuilder()
                            .setColor(0x9B59B6)
                            .setTitle(`🧠 Infos système ${system.symbol} ${system.name}`)
                            .addFields(
                                { name: '📖 Description', value: champ(system.description) },
                                { name: '✦ Symbole décoratif', value: champ(system.symbol), inline: true },
                                { name: '👥 Nombre de membres', value: result.count.toString(), inline: true },
                                { name: '🆔 Identifiant système', value: system.id.toString(), inline: true },
                                { name: '⏱️ Créé le', value: new Date(system.created_at).toLocaleDateString(), inline: true },
                                { name: '🌍 Fuseau horaire', value: champ(system.timezone), inline: true },
                                { name: '👑 Front actuel', value: front ? front.name : 'Aucun', inline: true }
                            )
                            .setFooter({ text: 'Altéra - pluriel assistant ✧' })
                            .setTimestamp();
                        if (front && front.avatar_url) {
                            embed.setThumbnail(front.avatar_url);
                        }
                        await interaction.reply({ embeds: [embed] });
                    });
                });
            });
        }

        else if (subcommand === 'edit') {
            const userId = interaction.user.id;
            const name = interaction.options.getString('name');
            let symbol = interaction.options.getString('symbol');
            const customSymbol = interaction.options.getString('custom_symbol');
            const description = interaction.options.getString('description');
            const timezone = interaction.options.getString('timezone');

            // Vérifier qu'au moins un champ est modifié
            if (!name && !symbol && !customSymbol && !description && !timezone) {
                return await interaction.reply({ 
                    content: 'Vous devez spécifier au moins un champ à modifier.', 
                    ephemeral: true 
                });
            }

            // Gérer le symbole personnalisé
            if (symbol === 'custom') {
                if (!customSymbol) {
                    return await interaction.reply({ 
                        content: 'Vous devez spécifier un symbole personnalisé.', 
                        ephemeral: true 
                    });
                }
                if (!isValidSymbol(customSymbol)) {
                    return await interaction.reply({ 
                        content: 'Le symbole doit être un seul caractère Unicode ou un emoji.', 
                        ephemeral: true 
                    });
                }
                symbol = customSymbol;
            }

            // Construire la requête SQL dynamiquement
            let updateFields = [];
            let params = [];
            
            if (name) {
                updateFields.push('name = ?');
                params.push(name);
            }
            if (symbol) {
                updateFields.push('symbol = ?');
                params.push(symbol);
            }
            if (description) {
                updateFields.push('description = ?');
                params.push(description);
            }
            if (timezone) {
                updateFields.push('timezone = ?');
                params.push(timezone);
            }

            params.push(userId); // Pour la clause WHERE

            db.run(`UPDATE systems SET ${updateFields.join(', ')} WHERE user_id = ?`,
                params,
                async function(err) {
                    if (err) {
                        console.error(err);
                        return await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
                    }

                    if (this.changes === 0) {
                        return await interaction.reply({ 
                            content: 'Vous n\'avez pas encore de système enregistré.', 
                            ephemeral: true 
                        });
                    }

                    // Utiliser un embed de succès stylé (public)
                    const successEmbed = new EmbedBuilder()
                        .setColor(0x2ECC71) // Vert pour succès
                        .setTitle('✅ Système mis à jour !')
                        .setDescription('Les informations de votre système ont été mises à jour avec succès.')
                        .setFooter({ text: 'Altéra • Pour les systèmes ✧' })
                        .setTimestamp();

                    // Ajouter les champs mis à jour
                    if (name) {
                        successEmbed.addFields({ name: 'Nouveau nom', value: name, inline: true });
                    }
                    if (symbol) {
                        successEmbed.addFields({ name: 'Nouveau symbole', value: symbol, inline: true });
                    }
                    if (description) {
                        successEmbed.addFields({ name: 'Nouvelle description', value: description, inline: false });
                    }
                    if (timezone) {
                        successEmbed.addFields({ name: 'Nouveau fuseau horaire', value: timezone, inline: true });
                    }

                    await interaction.reply({ embeds: [successEmbed], ephemeral: false }); // Public
                });
        }
    },
}; 