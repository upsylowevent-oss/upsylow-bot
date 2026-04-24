const { log } = require("../utils/helpers");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    await log(member.guild, `Nouveau membre : ${member.user.tag}`);
  }
};
