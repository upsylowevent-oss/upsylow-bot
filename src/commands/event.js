const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const config = require("../config");
const { embed, log } = require("../utils/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Créer un message de présence pour un événement")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName("nom").setDescription("Nom de l'événement").setRequired(true))
    .addStringOption(o => o.setName("date").setDescription("Date / horaires").setRequired(true))
    .addStringOption(o => o.setName("lieu").setDescription("Lieu").setRequired(false)),

  async execute(interaction) {
    const name = interaction.options.getString("nom");
    const date = interaction.options.getString("date");
    const place = interaction.options.getString("lieu") || "À confirmer";

    const channel = interaction.guild.channels.cache.find(c => c.name === config.channels.eventPresence) || interaction.channel;

    const eventId = `${Date.now()}`;

    const e = embed(`✅ Présences bénévoles — ${name}`, [
      `📅 **Date :** ${date}`,
      `📍 **Lieu :** ${place}`,
      "",
      "Clique pour indiquer ta présence :",
      "",
      "✅ Présent",
      "❌ Absent",
      "⏳ Peut-être"
    ].join("\n"))
      .setFooter({ text: `Event ID: ${eventId}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`event_yes_${eventId}`).setLabel("✅ Présent").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`event_no_${eventId}`).setLabel("❌ Absent").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`event_maybe_${eventId}`).setLabel("⏳ Peut-être").setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [e], components: [row] });
    await log(interaction.guild, `Event créé par ${interaction.user.tag}`, `${name} — ${date}`);
    await interaction.reply({ content: `✅ Message de présence créé dans ${channel}`, ephemeral: true });
  }
};
