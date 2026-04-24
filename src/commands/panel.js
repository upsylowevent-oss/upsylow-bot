const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { sendOrUpdatePanels } = require("../setup-server");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Recrée/met à jour les panels UPSYLOW")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await sendOrUpdatePanels(interaction.guild);
    await interaction.editReply("✅ Panels mis à jour.");
  }
};
