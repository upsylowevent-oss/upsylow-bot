const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { setupServer } = require("../setup-server");
const { log } = require("../utils/helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure entièrement le serveur UPSYLOW")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await setupServer(interaction.guild);
    await log(interaction.guild, `Setup lancé par ${interaction.user.tag}`);
    await interaction.editReply("✅ Setup UPSYLOW terminé. Structure, rôles, salons et panels créés/mis à jour.");
  }
};
