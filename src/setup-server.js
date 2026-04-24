const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits
} = require("discord.js");
const config = require("./config");
const {
  getOrCreateRole,
  getOrCreateCategory,
  getOrCreateTextChannel,
  getOrCreateVoiceChannel,
  embed,
  sendOrUpdatePanel,
  staffOverwrites,
  privateRoleOverwrites,
  memberOnlyOverwrites
} = require("./utils/helpers");

async function setupServer(guild) {
  const founder = await getOrCreateRole(guild, config.roleNames.founder, 0x3b0066, [PermissionFlagsBits.Administrator]);
  const staff = await getOrCreateRole(guild, config.roleNames.staff, 0x8a2be2);
  const member = await getOrCreateRole(guild, config.roleNames.member, 0x7b2cff);
  const volunteer = await getOrCreateRole(guild, config.roleNames.volunteer, 0x2ecc71);
  const dj = await getOrCreateRole(guild, config.roleNames.dj, 0xff4fd8);
  const technical = await getOrCreateRole(guild, config.roleNames.technical, 0x3498db);
  const security = await getOrCreateRole(guild, config.roleNames.security, 0xe74c3c);
  const bar = await getOrCreateRole(guild, config.roleNames.bar, 0xf1c40f);
  const entry = await getOrCreateRole(guild, config.roleNames.entry, 0xe67e22);
  const safer = await getOrCreateRole(guild, config.roleNames.safer, 0xff69b4);
  const cleaning = await getOrCreateRole(guild, config.roleNames.cleaning, 0x95a5a6);
  const montage = await getOrCreateRole(guild, config.roleNames.montage, 0x1abc9c);
  const photoVideo = await getOrCreateRole(guild, config.roleNames.photoVideo, 0x9b59b6);
  const logistics = await getOrCreateRole(guild, config.roleNames.logistics, 0x16a085);

  for (const music of config.musicRoles) {
    await getOrCreateRole(guild, `🎶 ${music}`, 0x7b2cff);
  }

  const publicLocked = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: staff.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: founder.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] }
  ];

  const infoCat = await getOrCreateCategory(guild, "📌 INFOS", [
    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
    { id: staff.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }
  ]);

  const communityCat = await getOrCreateCategory(guild, "🌐 COMMUNAUTÉ", publicLocked);
  const eventsCat = await getOrCreateCategory(guild, "🎉 ÉVÉNEMENTS", publicLocked);
  const contactCat = await getOrCreateCategory(guild, "🎫 CONTACT", publicLocked);
  const volunteersCat = await getOrCreateCategory(guild, "🙋 BÉNÉVOLES", privateRoleOverwrites(guild, [volunteer, staff, founder]));
  const djCat = await getOrCreateCategory(guild, "🎧 DJ", privateRoleOverwrites(guild, [dj, staff, founder]));
  const techCat = await getOrCreateCategory(guild, "🔊 TECHNIQUE", privateRoleOverwrites(guild, [technical, montage, staff, founder]));
  const staffCat = await getOrCreateCategory(guild, "🧠 STAFF", staffOverwrites(guild, staff, founder));
  const logsCat = await getOrCreateCategory(guild, "🔒 LOGS", staffOverwrites(guild, staff, founder));

  const rules = await getOrCreateTextChannel(guild, config.channels.rules, infoCat, [
    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
    { id: staff.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }
  ]);
  const welcome = await getOrCreateTextChannel(guild, config.channels.welcome, infoCat);
  const rolesChannel = await getOrCreateTextChannel(guild, config.channels.roles, infoCat, memberOnlyOverwrites(guild, member));

  await getOrCreateTextChannel(guild, "💬・général", communityCat);
  await getOrCreateTextChannel(guild, "🎵・musique", communityCat);
  await getOrCreateTextChannel(guild, "🔥・underground", communityCat);
  await getOrCreateTextChannel(guild, "📸・photos", communityCat);

  await getOrCreateTextChannel(guild, "📢・annonces", eventsCat);
  await getOrCreateTextChannel(guild, "📅・événements", eventsCat);
  await getOrCreateTextChannel(guild, "🎟️・préventes", eventsCat);
  await getOrCreateTextChannel(guild, "🎧・line-up", eventsCat);
  await getOrCreateTextChannel(guild, "📸・aftermovie", eventsCat);

  const tickets = await getOrCreateTextChannel(guild, config.channels.tickets, contactCat);
  const volunteerApply = await getOrCreateTextChannel(guild, config.channels.volunteerApply, contactCat);

  await getOrCreateTextChannel(guild, "📋・briefing", volunteersCat);
  await getOrCreateTextChannel(guild, "🕒・planning", volunteersCat);
  await getOrCreateTextChannel(guild, config.channels.eventPresence, volunteersCat);
  await getOrCreateTextChannel(guild, "📦・missions", volunteersCat);
  await getOrCreateTextChannel(guild, "💬・discussion-bénévoles", volunteersCat);
  await getOrCreateTextChannel(guild, "⚠️・urgences", volunteersCat);
  await getOrCreateVoiceChannel(guild, "🔊 Coordination", volunteersCat);

  await getOrCreateTextChannel(guild, "🎧・booking", djCat);
  await getOrCreateTextChannel(guild, "📋・brief-dj", djCat);
  await getOrCreateTextChannel(guild, "🕒・planning-dj", djCat);
  await getOrCreateTextChannel(guild, "🔊・rider-technique", djCat);

  await getOrCreateTextChannel(guild, "🔊・son", techCat);
  await getOrCreateTextChannel(guild, "💡・lumière", techCat);
  await getOrCreateTextChannel(guild, "🔌・électricité", techCat);
  await getOrCreateTextChannel(guild, "🛠️・montage", techCat);
  await getOrCreateTextChannel(guild, "📦・matériel", techCat);

  await getOrCreateTextChannel(guild, "🧠・organisation", staffCat);
  await getOrCreateTextChannel(guild, "💰・budget-compta", staffCat);
  await getOrCreateTextChannel(guild, "📦・stock-bar", staffCat);
  await getOrCreateTextChannel(guild, config.channels.volunteerApplications, staffCat);
  await getOrCreateTextChannel(guild, config.channels.djApplications, staffCat);
  await getOrCreateTextChannel(guild, config.channels.staffAnnouncements, staffCat);
  await getOrCreateTextChannel(guild, config.channels.logs, logsCat);

  await sendOrUpdatePanels(guild, { rules, welcome, rolesChannel, tickets, volunteerApply });
}

async function sendOrUpdatePanels(guild, channels = {}) {
  const rules = channels.rules || guild.channels.cache.find(c => c.name === config.channels.rules);
  const welcome = channels.welcome || guild.channels.cache.find(c => c.name === config.channels.welcome);
  const rolesChannel = channels.rolesChannel || guild.channels.cache.find(c => c.name === config.channels.roles);
  const tickets = channels.tickets || guild.channels.cache.find(c => c.name === config.channels.tickets);
  const volunteerApply = channels.volunteerApply || guild.channels.cache.find(c => c.name === config.channels.volunteerApply);

  if (rules) {
    await sendOrUpdatePanel(rules, "[UPSYLOW_PANEL_RULES]", {
      embeds: [embed("📜 Règlement UPSYLOW", [
        "Bienvenue chez UPSYLOW.",
        "",
        "Ici c’est festif, underground, mais carré.",
        "",
        "✅ Respect obligatoire entre membres, staff, DJs et bénévoles.",
        "🚫 Pas d’insultes, harcèlement, spam, propos haineux ou contenu illégal.",
        "🎧 Respect de l’esprit : bonne vibe, entraide, passion du son.",
        "🛡️ Le staff peut modérer si nécessaire.",
        "",
        "Clique sur le bouton pour accéder au serveur."
      ].join("\n"))],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("rules_accept")
            .setLabel("✅ J’accepte le règlement")
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }

  if (welcome) {
    await sendOrUpdatePanel(welcome, "[UPSYLOW_PANEL_WELCOME]", {
      embeds: [embed("🔥 Bienvenue sur UPSYLOW", [
        "Bienvenue dans la zone UPSYLOW.",
        "",
        "🎧 Techno / hard / tribe / underground",
        "🍻 Events, bénévoles, DJs, technique",
        "🤝 Communauté propre et motivée",
        "",
        "Va dans le salon des rôles pour choisir tes styles musicaux."
      ].join("\n"))]
    });
  }

  if (rolesChannel) {
    const rows = [];
    const chunks = [];
    const roles = config.musicRoles;
    for (let i = 0; i < roles.length; i += 25) chunks.push(roles.slice(i, i + 25));

    chunks.forEach((chunk, idx) => {
      rows.push(new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`music_roles_${idx}`)
          .setPlaceholder("Choisis / retire tes styles musicaux")
          .setMinValues(0)
          .setMaxValues(Math.min(25, chunk.length))
          .addOptions(chunk.map(name => ({
            label: name,
            value: name,
            emoji: "🎶"
          })))
      ));
    });

    await sendOrUpdatePanel(rolesChannel, "[UPSYLOW_PANEL_MUSIC_ROLES]", {
      embeds: [embed("🎭 Choix des rôles musicaux", "Sélectionne tes styles. Si tu sélectionnes un rôle que tu as déjà, le bot le retire.")],
      components: rows.slice(0, 5)
    });
  }

  if (tickets) {
    await sendOrUpdatePanel(tickets, "[UPSYLOW_PANEL_TICKETS]", {
      embeds: [embed("🎫 Contact UPSYLOW", [
        "Ouvre un ticket privé selon ta demande.",
        "",
        "📩 Contact : question générale",
        "🎧 Booking DJ : proposer un set",
        "❤️ Safer : signalement discret / prévention"
      ].join("\n"))],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("ticket_contact").setLabel("📩 Contact").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("ticket_dj").setLabel("🎧 Booking DJ").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("ticket_safer").setLabel("❤️ Safer").setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }

  if (volunteerApply) {
    await sendOrUpdatePanel(volunteerApply, "[UPSYLOW_PANEL_VOLUNTEER]", {
      embeds: [embed("🙋 Devenir bénévole UPSYLOW", [
        "Tu veux aider sur les événements UPSYLOW ?",
        "",
        "Clique sur le bouton, remplis le formulaire, puis le staff validera ta candidature.",
        "",
        "Postes possibles : bar, entrée, safer, technique, montage, ménage, photo, logistique..."
      ].join("\n"))],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("volunteer_apply").setLabel("🙋 Remplir le formulaire bénévole").setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
}

module.exports = { setupServer, sendOrUpdatePanels };
