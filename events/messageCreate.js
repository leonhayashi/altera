const { WebhookClient, EmbedBuilder } = require('discord.js');
const db = require('../database/database');
const stringSimilarity = require('string-similarity');

// Détecte un tag potentiel au début du message (le premier mot)
// Utilise le fuzzy matching pour trouver l'alter correspondant
function detectProxyTag(messageContent, members) {
    // Regex pour capter la première séquence de caractères non-espace au début (trimmé des espaces initiaux)
    const tagMatch = messageContent.match(/^\s*([^\s]+)/);
    if (!tagMatch) return null; // Pas de mot trouvé au début

    const rawTag = tagMatch[1];
    const cleanTag = rawTag.trim().toLowerCase(); // Tag potentiel nettoyé (trim + minuscules)

    if (cleanTag.length === 0) return null; // Ignorer les mots vides

    // Extraire tous les tags des membres pour la comparaison floue
    const memberTags = members.map(m => m.tag.toLowerCase());

    // Utiliser string-similarity pour trouver la meilleure correspondance
    const matches = stringSimilarity.findBestMatch(cleanTag, memberTags);
    const bestMatch = matches.bestMatch;

    // Seuil de similarité (ajustez si nécessaire)
    const similarityThreshold = 0.6; // Peut-être ajuster ce seuil ?

    // Optionnel: Ajouter un log pour debug le score de similarité
    // console.log(`Comparaison pour "${cleanTag}": Meilleure correspondance "${bestMatch.target}" avec un score de ${bestMatch.rating}`);

    if (bestMatch.rating > similarityThreshold) {
        // Trouver le membre correspondant à la meilleure correspondance
        const memberIndex = memberTags.indexOf(bestMatch.target);
        return members[memberIndex];
    }

    return null; // Aucune correspondance suffisante trouvée
}

// Formate le nom à utiliser pour le webhook
function formatWebhookName(alterName, systemName, systemSymbol) { // Utiliser systemName et systemSymbol directement
    return `${alterName} | ${systemName} ${systemSymbol || ''}`.trim();
}

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignorer les messages des bots et les messages vides
        if (message.author.bot || !message.content) return;

        const userId = message.author.id;

        // Rechercher le système de l'utilisateur (pour le nom et le symbole)
        db.get('SELECT id, name, symbol FROM systems WHERE user_id = ?', [userId], async (err, system) => {
            if (err) {
                console.error('Erreur lors de la recherche du système:', err);
                return;
            }

            // Si l'utilisateur n'a pas de système, on arrête
            if (!system) return;

            let memberToProxy = null;
            let messageContent = message.content;

            // Récupérer tous les membres du système pour recherche par tag et front
            db.all('SELECT * FROM members WHERE system_id = ?', [system.id], async (err, members) => {
                if (err) {
                    console.error('Erreur lors de la recherche des membres:', err);
                    return;
                }

                // 1. Tenter de détecter le tag proxy au début du message (premier mot)
                const taggedMember = detectProxyTag(messageContent, members);

                if (taggedMember) {
                    memberToProxy = taggedMember;
                    // Retirer le mot détecté du contenu du message
                    const tagMatchResult = messageContent.match(/^\s*([^\s]+)/);
                     if (tagMatchResult && tagMatchResult[0]) { // Vérifier que le match a réussi et n'est pas vide
                         const tagLength = tagMatchResult[0].length; // Longueur du mot + espaces initiaux
                         messageContent = messageContent.slice(tagLength).trim(); // Retirer et trimmer le reste
                     }

                    // *** AJOUT : Vérifier si le contenu restant est vide après avoir retiré le tag ***
                    if (messageContent.length === 0) {
                        // Optionnel: Supprimer le message original si vide
                        try {
                            await message.delete();
                        } catch (deleteError) {
                            console.error('Erreur lors de la suppression du message vide:', deleteError);
                        }
                        return; // Arrêter le traitement si le message est vide
                    }

                    // Si un membre est trouvé par tag, proxy le message immédiatement
                    proxyMessage(message, memberToProxy, messageContent, system);

                } else { // 2. Si pas de tag valide au début, vérifier le membre en front
                    db.get('SELECT m.* FROM switches s JOIN members m ON s.member_id = m.id WHERE s.system_id = ? ORDER BY s.switched_at DESC LIMIT 1', [system.id], async (err, frontMember) => {
                         if (err) {
                            console.error('Erreur lors de la recherche du membre en front:', err);
                            // On continue même s'il y a une erreur ici
                        }

                        if (frontMember) {
                            memberToProxy = frontMember;
                            // messageContent est déjà le message original si pas de tag

                            // Si un membre en front est trouvé (et pas de tag avant), proxy le message
                            proxyMessage(message, memberToProxy, messageContent, system);
                        } else {
                            
                        }
                     });
                 }
            });
        });
    },
};

async function proxyMessage(originalMessage, member, content, system) { // Assurez-vous que system est passé ici
    try {
        // Supprimer le message original
        await originalMessage.delete();

        // Récupérer ou créer un webhook
        const webhooks = await originalMessage.channel.fetchWebhooks();
        let webhook = webhooks.find(wh => wh.owner.id === originalMessage.client.user.id);

        if (!webhook) {
            console.log(`Création du webhook dans le salon ${originalMessage.channel.name} (${originalMessage.channel.id}).`);
            webhook = await originalMessage.channel.createWebhook({
                name: 'Altéra Proxy', // Nom fixe pour le webhook du bot
                avatar: originalMessage.client.user.displayAvatarURL(), // Avatar du bot pour le webhook
            });
        }

        // Envoyer le message via webhook avec le format de nom correct
        await webhook.send({
            content: content,
            username: formatWebhookName(member.name, system.name, system.symbol), // Utiliser le format correct
            avatarURL: member.avatar_url || originalMessage.author.displayAvatarURL({ dynamic: true }),
            threadId: originalMessage.threadId,
            allowedMentions: { parse: ['users', 'roles', 'everyone'] },
            // Ajouter l'embed pour les messages de réponse
            embeds: await buildReplyEmbed(originalMessage) // Appel à la nouvelle fonction buildReplyEmbed
        });

    } catch (error) {
        console.error('Erreur lors du proxying du message:', error);
        originalMessage.author.send(`Désolé, une erreur est survenue lors du proxy de votre message dans le salon ${originalMessage.channel.name}.`).catch(console.error);
    }
}

// Construit un embed pour les messages de réponse
async function buildReplyEmbed(originalMessage) {
    // Vérifier si c'est une réponse et si la référence est valide
    if (!originalMessage.reference || !originalMessage.reference.messageId) {
        return []; // Pas une réponse valide, retourner un tableau vide d'embeds
    }

    try {
        // Tenter de récupérer le message original référencé
        const repliedMessage = await originalMessage.channel.messages.fetch(originalMessage.reference.messageId);

        if (!repliedMessage) {
            return []; // Message original non trouvé
        }

        // Construire l'URL du message original (format standard Discord)
        const messageURL = `https://discord.com/channels/${repliedMessage.guildId}/${repliedMessage.channelId}/${repliedMessage.id}`;

        const embed = new EmbedBuilder()
            .setColor('#9B59B6') // Couleur lavande/violet
            .setAuthor({
                name: repliedMessage.member.displayName, // Nom d'affichage de l'auteur du message original
                iconURL: repliedMessage.author.displayAvatarURL({ dynamic: true }) // Avatar de l'auteur
            })
            .setDescription(`**Réponse à :** [Message](${messageURL})`)
            .addFields({
                 name: 'Contenu original :',
                 value: repliedMessage.content || '*(Message sans contenu textuel - peut-être un embed/image)*' // Afficher le contenu ou un message si vide
            })
            .setTimestamp();

        return [embed]; // Retourner l'embed dans un tableau

    } catch (error) {
        console.error('Erreur lors de la construction de l\'embed de réponse:', error);
        return []; // Retourner un tableau vide en cas d'erreur
    }
} 