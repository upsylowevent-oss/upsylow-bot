const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");

const config = require("../config");
const { readStore, writeStore } = require("../utils/store");
const { embed, log, getOrCreateRole } = require("../utils/helpers");

function safeName(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-_]/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

async function createTicket(interaction, type) {
  const store = readStore();
  const key = `${interaction.guild.id}_${interaction.user.id}_${type}`;

  if (store.tickets[key]) {
    const existing = interaction.guild.channels.cache.get(store.tickets[key]);
    if (existing) {
      return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });
    }
    delete store.tickets[key];
    writeStore(store);
  }

  const staffRole = interaction.guild.roles.cache.find(r => r.name === config.roleNames.staff);
  const founderRole = interaction.guild.roles.cache.find(r => r.name === config.roleNames.founder);

  const typeLabel = {
    contact: "contact",
    dj: "booking-dj",
    safer: "safer"
  }[type] || "ticket";

  const channel = await interaction.guild.channels.create({
    name: `ticket-${typeLabel}-${safeName(interaction.user.username)}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(staffRole ? [{ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : []),
      ...(founderRole ? [{ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }] : [])
    ],
    reason: `Ticket UPSYLOW ${type}`
  });

  store.tickets[key] = channel.id;
  writeStore(store);

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_close_${key}`).setLabel("🔒 Fermer le ticket").setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `${interaction.user} ${staffRole ? staffRole : ""}`,
    embeds: [embed(`🎫 Ticket ${typeLabel}`, [
      "Explique ta demande ici.",
      "Un membre du staff te répondra dès que possible.",
      "",
      type === "safer" ? "❤️ Ce ticket est privé et traité avec discrétion." : ""
    ].join("\n"))],
    components: [closeRow]
  });

  await log(interaction.guild, `Ticket ouvert : ${typeLabel}`, `${interaction.user.tag} → ${channel.name}`);
  await interaction.reply({ content: `✅ Ticket créé : ${channel}`, ephemeral: true });
}

async function handleVolunteerApplication(interaction) {
  const roleChoice = interaction.fields.getTextInputValue("role_choice");
  const identity = interaction.fields.getTextInputValue("identity");
  const phone = interaction.fields.getTextInputValue("phone");
  const availability = interaction.fields.getTextInputValue("availability");
  const motivation = interaction.fields.getTextInputValue("motivation");

  const appId = `${Date.now()}_${interaction.user.id}`;
  const store = readStore();
  store.volunteerApplications[appId] = {
    userId: interaction.user.id,
    roleChoice,
    identity,
    phone,
    availability,
    motivation,
    status: "pending"
  };
  writeStore(store);

  const channel = interaction.guild.channels.cache.find(c => c.name === config.channels.volunteerApplications);
  if (!channel) {
    return interaction.reply({ content: "❌ Salon candidatures introuvable. Lance /setup.", ephemeral: true });
  }

  const e = embed("🙋 Nouvelle candidature bénévole", "")
    .addFields(
      { name: "Utilisateur", value: `${interaction.user} (${interaction.user.tag})`, inline: false },
      { name: "Identité", value: identity || "Non renseigné", inline: false },
      { name: "Rôle souhaité", value: roleChoice || "Non renseigné", inline: false },
      { name: "Téléphone / urgence", value: phone || "Non renseigné", inline: false },
      { name: "Disponibilités", value: availability || "Non renseigné", inline: false },
      { name: "Motivation / expérience", value: motivation || "Non renseigné", inline: false }
    )
    .setFooter({ text: `Application ID: ${appId}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`vol_accept_${appId}`).setLabel("✅ Accepter").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`vol_review_${appId}`).setLabel("🟡 À revoir").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`vol_reject_${appId}`).setLabel("❌ Refuser").setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [e], components: [row] });
  await log(interaction.guild, "Nouvelle candidature bénévole", `${interaction.user.tag} — ${roleChoice}`);
  await interaction.reply({ content: "✅ Candidature envoyée au staff. Merci pour ta motivation 🔥", ephemeral: true });
}

async function handleDjApplication(interaction) {
  const artist = interaction.fields.getTextInputValue("artist");
  const style = interaction.fields.getTextInputValue("style");
  const links = interaction.fields.getTextInputValue("links");
  const city = interaction.fields.getTextInputValue("city");
  const notes = interaction.fields.getTextInputValue("notes");

  const channel = interaction.guild.channels.cache.find(c => c.name === config.channels.djApplications);
  if (!channel) {
    return interaction.reply({ content: "❌ Salon booking staff introuvable. Lance /setup.", ephemeral: true });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_dj").setLabel("🎫 Créer ticket DJ").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    embeds: [
      embed("🎧 Nouvelle demande Booking DJ", "")
        .addFields(
          { name: "Utilisateur", value: `${interaction.user} (${interaction.user.tag})`, inline: false },
          { name: "Nom DJ", value: artist || "Non renseigné", inline: true },
          { name: "Style", value: style || "Non renseigné", inline: true },
          { name: "Ville", value: city || "Non renseigné", inline: true },
          { name: "Liens", value: links || "Non renseigné", inline: false },
          { name: "Expérience / cachet / dispo", value: notes || "Non renseigné", inline: false }
        )
    ]
  });

  await log(interaction.guild, "Nouvelle demande booking DJ", `${interaction.user.tag} — ${artist} — ${style}`);
  await interaction.reply({ content: "✅ Demande DJ envoyée au staff.", ephemeral: true });
}

async function decideVolunteer(interaction, action, appId) {
  const store = readStore();
  const app = store.volunteerApplications[appId];

  if (!app) {
    return interaction.reply({ content: "❌ Candidature introuvable.", ephemeral: true });
  }

  const member = await interaction.guild.members.fetch(app.userId).catch(() => null);
  if (!member) {
    return interaction.reply({ content: "❌ Membre introuvable sur le serveur.", ephemeral: true });
  }

  if (action === "review") {
    app.status = "review";
    writeStore(store);
    await log(interaction.guild, `Candidature mise à revoir`, `${member.user.tag} par ${interaction.user.tag}`);
    return interaction.reply({ content: "🟡 Candidature marquée À revoir.", ephemeral: true });
  }

  if (action === "reject") {
    app.status = "rejected";
    writeStore(store);
    await member.send("Salut, ta candidature bénévole UPSYLOW n’a pas été retenue pour le moment. Merci quand même pour ta motivation 🙏").catch(() => {});
    await log(interaction.guild, `Candidature refusée`, `${member.user.tag} par ${interaction.user.tag}`);
    return interaction.reply({ content: "❌ Candidature refusée.", ephemeral: true });
  }

  if (action === "accept") {
    app.status = "accepted";
    writeStore(store);

    const volunteerRole = await getOrCreateRole(interaction.guild, config.roleNames.volunteer, 0x2ecc71);
    await member.roles.add(volunteerRole).catch(() => {});

    const wanted = app.roleChoice.toLowerCase();
    for (const choice of config.volunteerRoleChoices) {
      if (wanted.includes(choice.label.toLowerCase().split(" ")[0]) || wanted.includes(choice.role.replace(/^[^\w]+/, "").toLowerCase().split(" ")[0])) {
        const role = interaction.guild.roles.cache.find(r => r.name === choice.role);
        if (role) await member.roles.add(role).catch(() => {});
      }
    }

    const announce = interaction.guild.channels.cache.find(c => c.name === config.channels.staffAnnouncements);
    if (announce) {
      await announce.send(`✅ ${member} a été accepté comme bénévole UPSYLOW. Rôle souhaité : **${app.roleChoice}**`);
    }

    await member.send("🔥 Ta candidature bénévole UPSYLOW a été acceptée ! Tu as maintenant accès à l’espace bénévoles.").catch(() => {});
    await log(interaction.guild, `Candidature acceptée`, `${member.user.tag} par ${interaction.user.tag} — ${app.roleChoice}`);

    return interaction.reply({ content: "✅ Bénévole accepté + rôle donné.", ephemeral: true });
  }
}

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        return await command.execute(interaction, client);
      }

      if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("music_roles_")) {
          const added = [];
          const removed = [];

          for (const value of interaction.values) {
            const roleName = `🎶 ${value}`;
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);
            if (!role) continue;

            if (interaction.member.roles.cache.has(role.id)) {
              await interaction.member.roles.remove(role).catch(() => {});
              removed.push(value);
            } else {
              await interaction.member.roles.add(role).catch(() => {});
              added.push(value);
            }
          }

          return interaction.reply({
            content: `🎶 Rôles mis à jour.\nAjoutés : ${added.join(", ") || "aucun"}\nRetirés : ${removed.join(", ") || "aucun"}`,
            ephemeral: true
          });
        }
      }

      if (interaction.isButton()) {
        if (interaction.customId === "rules_accept") {
          const role = interaction.guild.roles.cache.find(r => r.name === config.roleNames.member);
          if (!role) return interaction.reply({ content: "❌ Rôle Membre introuvable. Lance /setup.", ephemeral: true });

          await interaction.member.roles.add(role);
          await log(interaction.guild, "Règlement accepté", interaction.user.tag);
          return interaction.reply({ content: "✅ Règlement accepté. Bienvenue chez UPSYLOW 🔥", ephemeral: true });
        }

        if (interaction.customId === "volunteer_apply") {
          const modal = new ModalBuilder()
            .setCustomId("modal_volunteer")
            .setTitle("Candidature bénévole UPSYLOW");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("identity")
                .setLabel("Prénom / pseudo / âge / ville")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("role_choice")
                .setLabel("Rôle voulu (bar, safer, son, montage...)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("phone")
                .setLabel("Téléphone + contact urgence")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("availability")
                .setLabel("Disponibilités")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("motivation")
                .setLabel("Motivation / expérience")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

          return interaction.showModal(modal);
        }

        if (interaction.customId === "ticket_contact") return createTicket(interaction, "contact");

        if (interaction.customId === "ticket_safer") return createTicket(interaction, "safer");

        if (interaction.customId === "ticket_dj") {
          const modal = new ModalBuilder()
            .setCustomId("modal_dj")
            .setTitle("Booking DJ UPSYLOW");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("artist").setLabel("Nom DJ / collectif").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("style").setLabel("Style musical").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("links").setLabel("Liens SoundCloud / Insta / set").setStyle(TextInputStyle.Paragraph).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("city").setLabel("Ville").setStyle(TextInputStyle.Short).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("notes").setLabel("Expérience / cachet / dispos").setStyle(TextInputStyle.Paragraph).setRequired(false)
            )
          );

          return interaction.showModal(modal);
        }

        if (interaction.customId.startsWith("ticket_close_")) {
          await interaction.reply({ content: "🔒 Fermeture du ticket dans 3 secondes...", ephemeral: true });
          const store = readStore();
          for (const [key, channelId] of Object.entries(store.tickets)) {
            if (channelId === interaction.channel.id) delete store.tickets[key];
          }
          writeStore(store);
          await log(interaction.guild, "Ticket fermé", `${interaction.channel.name} par ${interaction.user.tag}`);
          setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
          return;
        }

        if (interaction.customId.startsWith("vol_accept_")) {
          return decideVolunteer(interaction, "accept", interaction.customId.replace("vol_accept_", ""));
        }
        if (interaction.customId.startsWith("vol_reject_")) {
          return decideVolunteer(interaction, "reject", interaction.customId.replace("vol_reject_", ""));
        }
        if (interaction.customId.startsWith("vol_review_")) {
          return decideVolunteer(interaction, "review", interaction.customId.replace("vol_review_", ""));
        }

        if (interaction.customId.startsWith("event_")) {
          const [_, status, eventId] = interaction.customId.split("_");
          const store = readStore();
          if (!store.eventPresence[eventId]) store.eventPresence[eventId] = {};
          store.eventPresence[eventId][interaction.user.id] = status;
          writeStore(store);

          const label = status === "yes" ? "présent" : status === "no" ? "absent" : "peut-être";
          await interaction.reply({ content: `✅ Présence enregistrée : **${label}**`, ephemeral: true });
          await log(interaction.guild, "Présence événement", `${interaction.user.tag} → ${label} (event ${eventId})`);
          return;
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === "modal_volunteer") return handleVolunteerApplication(interaction);
        if (interaction.customId === "modal_dj") return handleDjApplication(interaction);
      }
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: "❌ Une erreur est survenue. Regarde les logs du bot.", ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content: "❌ Une erreur est survenue. Regarde les logs du bot.", ephemeral: true }).catch(() => {});
      }
    }
  }
};
