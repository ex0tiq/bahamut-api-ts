import APIHandler from "../modules/APIHandler";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";
import Discord from "discord.js";

const GuildChannelPermission: { [key: string]: string } = {
    CREATE_INSTANT_INVITE: Discord.PermissionsBitField.Flags.CreateInstantInvite.toString(),
    MANAGE_CHANNELS: Discord.PermissionsBitField.Flags.ManageChannels.toString(),
    VIEW_CHANNEL: Discord.PermissionsBitField.Flags.ViewChannel.toString(),
    SEND_MESSAGES: Discord.PermissionsBitField.Flags.SendMessages.toString(),
    SEND_TTS_MESSAGES: Discord.PermissionsBitField.Flags.SendTTSMessages.toString(),
    MANAGE_MESSAGES: Discord.PermissionsBitField.Flags.ManageMessages.toString(),
    EMBED_LINKS: Discord.PermissionsBitField.Flags.EmbedLinks.toString(),
    ATTACH_FILES: Discord.PermissionsBitField.Flags.AttachFiles.toString(),
    MENTION_EVERYONE: Discord.PermissionsBitField.Flags.MentionEveryone.toString(),
    USE_EXTERNAL_EMOJIS: Discord.PermissionsBitField.Flags.UseExternalEmojis.toString(),
    CONNECT: Discord.PermissionsBitField.Flags.Connect.toString(),
    SPEAK: Discord.PermissionsBitField.Flags.Speak.toString(),
    MUTE_MEMBERS: Discord.PermissionsBitField.Flags.MuteMembers.toString(),
    DEAFEN_MEMBERS: Discord.PermissionsBitField.Flags.DeafenMembers.toString(),
    MOVE_MEMBERS: Discord.PermissionsBitField.Flags.MoveMembers.toString(),
    USE_VAD: Discord.PermissionsBitField.Flags.UseVAD.toString(),
    USE_APPLICATION_COMMANDS: Discord.PermissionsBitField.Flags.UseApplicationCommands.toString(),
    USE_EXTERNAL_STICKERS: Discord.PermissionsBitField.Flags.UseExternalStickers.toString(),
}, GuildPermission: { [key: string]: string } = {
    KICK_MEMBERS: Discord.PermissionsBitField.Flags.KickMembers.toString(),
    BAN_MEMBERS: Discord.PermissionsBitField.Flags.BanMembers.toString(),
    ADMINISTRATOR: Discord.PermissionsBitField.Flags.Administrator.toString(),
    MANAGE_GUILD: Discord.PermissionsBitField.Flags.ManageGuild.toString(),
    VIEW_AUDIT_LOG: Discord.PermissionsBitField.Flags.ViewAuditLog.toString(),
    READ_MESSAGE_HISTORY: Discord.PermissionsBitField.Flags.ReadMessageHistory.toString(),
    VIEW_GUILD_INSIGHTS: Discord.PermissionsBitField.Flags.ViewGuildInsights.toString(),
    MANAGE_NICKNAMES: Discord.PermissionsBitField.Flags.ManageNicknames.toString(),
    MANAGE_ROLES: Discord.PermissionsBitField.Flags.ManageRoles.toString(),
    MANAGE_WEBHOOKS: Discord.PermissionsBitField.Flags.ManageWebhooks.toString(),
    MANAGE_EMOJIS_AND_STICKERS: Discord.PermissionsBitField.Flags.ManageEmojisAndStickers.toString(),
    MANAGE_EVENTS: Discord.PermissionsBitField.Flags.ManageEvents.toString(),
    MANAGE_THREADS: Discord.PermissionsBitField.Flags.ManageThreads.toString(),
    CREATE_PUBLIC_THREADS: Discord.PermissionsBitField.Flags.CreatePublicThreads.toString(),
    CREATE_PRIVATE_THREADS: Discord.PermissionsBitField.Flags.CreatePrivateThreads.toString(),
    SEND_MESSAGES_IN_THREADS: Discord.PermissionsBitField.Flags.SendMessagesInThreads.toString(),
    MODERATE_MEMBERS: Discord.PermissionsBitField.Flags.ModerateMembers.toString(),
};

const checkGuildChannelPermissions = async (apiHandler: APIHandler, guild: string, channel: string, required_permissions: string[]) => {
    const permsToCheck = required_permissions.filter(e => Object.keys(GuildChannelPermission).includes(e.toUpperCase())).map(e => {
        return {
            permission: e.toUpperCase(),
            bitfield: GuildChannelPermission[<string>e.toUpperCase()],
        };
    });

    if (!permsToCheck || permsToCheck.length <= 0) {
        return required_permissions.map(e => {
            return {
                permission: e,
                available: false,
            };
        });
    }

    const permResults = await apiHandler.manager.broadcastHandler.broadcastToGuild((_client: BahamutClient, obj: any) => {
        if (!obj.channelToCheck || !obj.permissionsToCheck) return null;

        // eslint-disable-next-line no-shadow
        const Discord = require("discord.js");

        // eslint-disable-next-line no-shadow
        let channel = _client.channels.cache.get(obj.channelToCheck);
        if (!channel || channel.type !== Discord.ChannelType.GuildText) return null;

        channel = <Discord.TextChannel>channel;
        const channelPerms = channel.permissionsFor(channel.guild.members.me!);

        return obj.permissionsToCheck.map((e: { permission: string, bitfield: string }) => {
            return {
                permission: e.permission,
                available: channelPerms.has(BigInt(e.bitfield)),
            };
        });
    }, guild, false, { permissionsToCheck: permsToCheck, channelToCheck: channel });

    return permResults?.flat(3).filter(e => e);
};

const checkGuildPermissions = async (apiHandler: APIHandler, guild: string, required_permissions: string[]) => {
    const permsToCheck = required_permissions.filter(e => Object.keys(GuildPermission).includes(e.toUpperCase())).map(e => {
        return {
            permission: e.toUpperCase(),
            bitfield: GuildPermission[<string>e.toUpperCase()],
        };
    });

    if (!permsToCheck || permsToCheck.length <= 0) {
        return required_permissions.map(e => {
            return {
                permission: e,
                available: false,
            };
        });
    }

    const permResults = await apiHandler.manager.broadcastHandler.broadcastToGuild((_client: BahamutClient, obj: any) => {
        if (!obj.guildToCheck || !obj.permissionsToCheck) return null;

        // eslint-disable-next-line no-shadow
        const guild = _client.guilds.cache.get(obj.guildToCheck);
        if (!guild) return null;

        const channelPerms = guild.members.me!.permissions;

        return obj.permissionsToCheck.map((e: { permission: string, bitfield: string }) => {
            return {
                permission: e.permission,
                available: channelPerms.has(BigInt(e.bitfield)),
            };
        });
    }, guild, false, { permissionsToCheck: permsToCheck, guildToCheck: guild });

    return permResults?.flat(3).filter(e => e);
};

export { checkGuildChannelPermissions, checkGuildPermissions };