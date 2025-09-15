const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('@discordjs/builders');

// Structure pour stocker les informations sur les troubles
const troublesInfo = {
    tdi: {
        label: '🧠 TDI (Trouble dissociatif de l\'identité)',
        description: 'Alters multiples, amnésie, déconnexion.',
        fullDescription: '**🧠 TDI (Trouble dissociatif de l\'identité)**\n\nAnciennement appelé \"trouble de la personnalité multiple\", le TDI est caractérisé par la présence de deux ou plusieurs états de personnalité distincts (alters) qui prennent le contrôle du comportement. Il s\'accompagne souvent de troubles de la mémoire (amnésie dissociative), de la conscience, de l\'identité, de l\'émotion, de la perception, du contrôle moteur et du comportement.\n\n*Précision :* Chaque système est unique. Les symptômes varient grandement d\'une personne à l\'autre.\n\n*Source : DSM-5*',
        color: 0x9B59B6 // Couleur douce
    },
    tdc: {
        label: '🌊 TDC (Trouble dissociatif complexe)',
        description: 'Troubles dissociatifs significatifs non classés comme TDI.',
        fullDescription: '**🌊 TDC (Trouble dissociatif complexe)**\n\nCette catégorie inclut les troubles dissociatifs qui ne répondent pas entièrement aux critères diagnostiques spécifiques du TDI, mais qui présentent des symptômes dissociatifs cliniquement significatifs. Cela peut inclure des états d\'identité partielle ou un contrôle moins fréquent du corps par les alters.\n\n*Précision :* C\'est une catégorie souvent utilisée pour des présentations atypiques de troubles dissociatifs sévères.\n\n*Source : DSM-5 (comme \"Autres troubles dissociatifs spécifiés\')*',
        color: 0x9B59B6 // Couleur douce
    },
    tspt_cpts: {
        label: '⚡ TSPT / CPTSD',
        description: 'Stress post-traumatique complexe, peut inclure dissociation.',
        fullDescription: '**⚡ TSPT (Trouble de stress post-traumatique) & CPTSD (TSPT Complexe)**\n\nLe TSPT se développe après avoir vécu ou été témoin d\'un événement traumatique. Le CPTSD résulte d\'un traumatisme chronique ou prolongé (abus, négligence). Ces troubles peuvent inclure des symptômes dissociatifs comme la dépersonnalisation (sentiment d\'être extérieur à son propre corps) ou la déréalisation (sentiment que le monde extérieur n\'est pas réel).\n\n*Précision :* La dissociation est un mécanisme de survie face au traumatisme, fréquent même sans diagnostic de TDI/TDC.\n\n*Source : DSM-5, littérature clinique sur le traumatisme*',
        color: 0x9B59B6 // Couleur douce
    },
     schizoaffectif: {
        label: '🌗 Trouble Schizoaffectif',
        description: 'Combine schizophrénie et troubles de l\'humeur.',
        fullDescription: '**🌗 Trouble Schizoaffectif**\n\nCe trouble est caractérisé par une combinaison de symptômes de la schizophrénie (hallucinations, délires) et de symptômes d\'un trouble de l\'humeur (dépression ou trouble bipolaire). Bien que distinct des troubles dissociatifs, il peut y avoir une confusion symptomatique ou une comorbidité.\n\n*Précision :* Un diagnostic différentiel précis par un professionnel est crucial.\n\n*Source : DSM-5*',
        color: 0x9B59B6 // Couleur douce
    },
     borderline: {
        label: '🎭 Trouble de la Personnalité Borderline (TPB)',
        description: 'Instabilité, impulsivité, épisodes dissociatifs.',
        fullDescription: '**🎭 Trouble de la Personnalité Borderline (TPB)**\n\nLe TPB implique souvent des épisodes de dissociation (sentiments de vide, déréalisation/dépersonnalisation) comme mécanisme d\'adaptation au stress intense. Bien que différent du TDI/TDC, il y a une forte comorbidité et une confusion possible des symptômes.\n\n*Précision :* La dissociation dans le TPB est généralement liée à des états émotionnels intenses plutôt qu\'à des états d\'identité distincts.\n\n*Source : DSM-5*',
        color: 0x9B59B6 // Couleur douce
    },
     dpdr: {
        label: '👻 Trouble de Dépersonnalisation/Déréalisation (TDDR)',
        description: 'Sentiment de détachement de soi ou de la réalité.',
        fullDescription: '**👻 Trouble de Dépersonnalisation/Déréalisation (TDDR)**\n\nCe trouble est caractérisé par des épisodes persistants ou récurrents de dépersonnalisation (sentiment d\'être un observateur extérieur de ses propres pensées, sentiments, sensations, corps ou actions) et/ou de déréalisation (sentiment que le monde extérieur – individus, objets, environnement – est irréel, onirique, brumeux, sans vie ou déformé visuellement). La réalité reste intacte, contrairement à la psychose.\n\n*Précision :* La dissociation est le symptôme central, mais sans altération de l\'identité comme dans le TDI/TDC.\n\n*Source : DSM-5*',
        color: 0x9B59B6 // Couleur douce
    },
     attachement: {
        label: '👶 Trouble de l\'Attachement',
        description: 'Difficultés à créer des liens affectifs sains.',
        fullDescription: '**👶 Trouble de l\'Attachement**\n\nLes troubles de l\'attachement (comme le trouble de l\'attachement réactionnel ou le trouble de l\'engagement social désinhibé) résultent de soins précoces gravement inadéquats. Ils peuvent influencer le développement de la régulation émotionnelle et des relations interpersonnelles. Bien que n\'étant pas un trouble dissociatif, un attachement désorganisé est fortement associé au développement de la dissociation et des troubles dissociatifs.\n\n*Précision :* L\'attachement sécure ou désorganisé a un impact majeur sur la capacité à gérer le stress et à former une identité cohérente.\n\n*Source : DSM-5, Théorie de l\'Attachement*',
        color: 0x9B59B6 // Couleur douce
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('troubles')
        .setDescription('Informations sur les troubles dissociatifs'),

    async execute(interaction) {
        // Embed initial avec le message de bienveillance et le menu
        const initialEmbed = new EmbedBuilder()
            .setColor(0x9B59B6) // Couleur douce
            .setTitle('🧠 Informations sur les troubles dissociatifs et associés')
            .setDescription('Sélectionnez un trouble dans le menu ci-dessous pour en savoir plus.')
            .addFields(
                {
                    name: '⚠️ Message Important',
                    value: 'Il n\'est **pas nécessaire d\'avoir un diagnostic médical pour utiliser Altéra**.\n❗ Mais il est **important de ne pas s\'autodiagnostiquer** : si tu te poses des questions, parles-en à un psychiatre ou psychologue qualifié et formé aux troubles dissociatifs et aux traumatismes complexes.',
                    inline: false
                }
            )
            .setFooter({
                text: 'Altéra • Ces informations sont à but informatif uniquement. ✧'
            })
            .setTimestamp();

        // Créer les options pour le menu déroulant à partir de la structure troublesInfo
        const selectMenuOptions = Object.keys(troublesInfo).map(key => ({
            label: troublesInfo[key].label,
            description: troublesInfo[key].description,
            value: key, // Utiliser la clé (ex: 'tdi') comme valeur
        }));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('troubles_menu')
                    .setPlaceholder('Choisissez un trouble...')
                    .addOptions(selectMenuOptions)
            );

        const replyMessage = await interaction.reply({ embeds: [initialEmbed], components: [row], ephemeral: false }); // Public par défaut

        // Créer un collecteur pour le menu
        const filter = i => i.customId === 'troubles_menu' && i.user.id === interaction.user.id;
        const collector = replyMessage.createMessageComponentCollector({ filter, time: 300000 }); // Collecter pendant 5 minutes

        collector.on('collect', async i => {
            const selectedTroubleKey = i.values[0];
            const selectedTrouble = troublesInfo[selectedTroubleKey];

            if (selectedTrouble) {
                // Créer l'embed détaillé pour le trouble sélectionné
                const troubleEmbed = new EmbedBuilder()
                    .setColor(selectedTrouble.color)
                    .setTitle(selectedTrouble.label) // Utiliser le label comme titre
                    .setDescription(selectedTrouble.fullDescription) // Afficher la description complète
                    .setFooter({
                        text: 'Altéra • Ces informations sont à but informatif uniquement. ✧'
                    })
                    .setTimestamp();

                // Mettre à jour le message original avec l'embed détaillé et le menu (pour pouvoir choisir un autre trouble)
                await i.update({ embeds: [initialEmbed, troubleEmbed], components: [row] }); // Inclure initialEmbed et row
            }
        });

        collector.on('end', collected => {
            // console.log(`Collected ${collected.size} interactions.`); // Optionnel: log de fin de collecte
            // Désactiver le menu à la fin de la collecte (optionnel)
            row.components.forEach(component => component.setDisabled(true));
            replyMessage.edit({ components: [row] }).catch(console.error);
        });
    },
}; 