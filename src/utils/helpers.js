const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");
const config = require("../config");

async function getOrCreateRole(guild, name, color = null, permissions = []) {
  let role = guild.roles.cache.find(r => r.name === name);
  if (!role) {
    role = await guild.roles.create({
      name,
      color: color || undefined,
      permissions,
      reason: "UPSYLOW setup"
    });
  }
  return role;
}

async function getOrCreateCategory(guild, name, overwrites = []) {
  let category = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildCategory);
  if (!category) {
    category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      permissionOverwrites: overwrites,
      reason: "UPSYLOW setup"
    });
  }
  return category;
}

async function getOrCreateTextChannel(guild, name, parent = null, overwrites = []) {
  let channel = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildText);
  if (!channel) {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: parent ? parent.id : null,
      permissionOverwrites: overwrites,
      reason: "UPSYLOW setup"
    });
  } else if (parent && channel.parentId !== parent.id) {
    await channel.setParent(parent.id).catch(() => {});
  }
  return channel;
}

async function getOrCreateVoiceChannel(guild, name, parent = null, overwrites = []) {
  let channel = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildVoice);
  if (!channel) {
    channel = await guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      parent: parent ? parent.id : null,
      permissionOverwrites: overwrites,
      reason: "UPSYLOW setup"
    });
  } else if (parent && channel.parentId !== parent.id) {
    await channel.setParent(parent.id).catch(() => {});
  }
  return channel;
}

function embed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(config.themeColor)
    .setFooter({ text: "UPSYLOW • Underground mais carré" });
}

async function sendOrUpdatePanel(channel, marker, payload) {
  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  const existing = messages?.find(m => m.author.bot && m.content?.includes(marker));
  const content = marker;
  if (existing) {
    await existing.edit({ content, ...payload });
    return existing;
  }
  return channel.send({ content, ...payload });
}

function staffOverwrites(guild, staffRole, founderRole) {
  return [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] }
  ];
}

function privateRoleOverwrites(guild, roles = []) {
  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }
  ];
  for (const role of roles) {
    overwrites.push({
      id: role.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
    });
  }
  return overwrites;
}

function memberOnlyOverwrites(guild, memberRole) {
  return [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: memberRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
  ];
}

async function log(guild, message, details = null) {
  const channel = guild.channels.cache.find(c => c.name === config.channels.logs);
  if (!channel) return;
  const e = embed("🔒 Log UPSYLOW", message);
  if (details) e.addFields({ name: "Détails", value: String(details).slice(0, 1000) });
  await channel.send({ embeds: [e] }).catch(() => {});
}

module.exports = {
  getOrCreateRole,
  getOrCreateCategory,
  getOrCreateTextChannel,
  getOrCreateVoiceChannel,
  embed,
  sendOrUpdatePanel,
  staffOverwrites,
  privateRoleOverwrites,
  memberOnlyOverwrites,
  log
};
