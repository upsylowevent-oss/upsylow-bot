const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embed } = require("../utils/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help-upsylow")
    .setDescription("Aide du bot UPSYLOW")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.reply({
      ephemeral: true,
      embeds: [embed("🧠 Aide UPSYLOW Bot", [
        "`/setup` : crée ou met à jour tout le serveur",
        "`/panel` : remet les panels sans tout recréer",
        "`/event` : crée un message de présence bénévoles",
        "",
        "Les candidatures bénévoles et DJ arrivent dans les salons staff.",
        "Les tickets Contact / DJ / Safer créent des salons privés.",
        "",
        "Pour héberger : GitHub + Railway, avec les variables DISCORD_TOKEN, CLIENT_ID, GUILD_ID."
      ].join("\n"))]
    });
  }
};
