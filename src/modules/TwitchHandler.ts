/* eslint-disable no-undef */
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { EventSubMiddleware, EventSubStreamOnlineEvent, EventSubSubscription } from "@twurple/eventsub";
import logger from "./Logger";
import { BahamutAPIHandler } from "../index";
import { Express } from "express";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

export default class TwitchHandler {
    private _apiManager;
    guild_twitch_subscriptions: { [guild: string]: any } = {};
    twitch_subscriptions: string[] = [];
    twitch_eventsubs: { [user: string]: EventSubSubscription } = {};

    authProvider;
    apiClient;
    signingSecret;

    middleware: EventSubMiddleware | undefined;

    constructor(_apiManager: BahamutAPIHandler) {
        this._apiManager = _apiManager;

        if (_apiManager.config.twitch && _apiManager.config.twitch.clientId && _apiManager.config.twitch.clientSecret && _apiManager.config.twitch.signingSecret) {
            this.authProvider = new ClientCredentialsAuthProvider(_apiManager.config.twitch.clientId, _apiManager.config.twitch.clientSecret);
            this.apiClient = new ApiClient({ authProvider: this.authProvider });
            this.signingSecret = _apiManager.config.twitch.signingSecret;
        }
    }

    loadAllTwitchSubscriptions = async () => {
        this.guild_twitch_subscriptions = await this.getAllTwitchSubscriptions();
        if (!this.guild_twitch_subscriptions) return;

        for (const val of Object.values(this.guild_twitch_subscriptions)) {
            for (const e of val.twitch_subscriptions) {
                if (!this.twitch_subscriptions.includes(e)) this.twitch_subscriptions.push(e);
            }
        }
    };

    getAllTwitchSubscriptions = async () => {
        return (await this._apiManager.dbHandler.guildSettings.getDBAllGuildSettings("twitch_subscriptions")) || [];
    };

    sendStreamOnlineNotification = async (streamEvent: EventSubStreamOnlineEvent) => {
        const stream = await streamEvent.getStream(),
            streamObj = {
            "gameName": stream.gameName,
            "id": stream.id,
            "viewers": stream.viewers,
            "isMature": stream.isMature,
            "title": stream.title,
            "thumbnailUrl": stream.getThumbnailUrl(320, 180),
        };
        const streamer = await streamEvent.getBroadcaster(),
            streamerObj = {
            "displayName": streamer.displayName,
            "id": streamer.id,
            "name": streamer.name,
            "thumbnailUrl": (await streamer.getStream())?.getThumbnailUrl(640, 360),
        };

        for (const [guild, subs] of Object.entries(this.guild_twitch_subscriptions)) {
            if (subs.includes(streamEvent.broadcasterId)) {
                await this._apiManager.apiHandler.manager.broadcastHandler.broadcastToGuild(async (_client: BahamutClient, obj: any) => {
                    const { getGuildSettings } = require(obj.rootPath + "/lib/getFunctions");

                    const settings = await getGuildSettings(_client, _client.guilds.cache.has(obj.guild)!);
                    if (!settings.twitch_notify_channel) return;

                    // Handle notify
                    const { MessageEmbed, Message } = require("discord.js");
                    const { resolveRole, resolveChannel } = require(obj.rootPath + "/lib/resolveFunctions");
                    const embed = new MessageEmbed(), msg = new Message(), role = (settings.twitch_notify_role ? (await resolveRole(this, null, settings.twitch_notify_role, false, obj.guild)) : null),
                        channel = await resolveChannel(this, null, settings.twitch_notify_channel, false, obj.guild);

                    embed.setColor(_client.bahamut.config.primary_message_color);
                    embed.setDescription(`[${obj.stream.title}](https://twitch.tv/${obj.streamer.name})`);
                    embed.setAuthor({ name: obj.streamer.displayName, iconURL: obj.streamer.thumbnailUrl });
                    embed.addField("Game", obj.stream.gameName);
                    embed.addField("Viewers", obj.stream.viewers);
                    embed.setThumbnail(obj.streamer.thumbnailUrl);
                    embed.setImage(obj.stream.thumbnailUrl);

                    msg.content = `${role ? `${role} ` : ""}${settings.twitch_notify_text}`;
                    msg.embeds = [embed];

                    await channel.send(msg);
                }, guild, false, { streamer: streamerObj, stream: streamObj });
            }
        }
    };

    /**
     * Search discord api for channels
     * @param {string} searchString
     * @returns null|[]
     */
    searchUsers = async (searchString: string) => {
        const channels = await this.apiClient!.search.searchChannels(searchString, { limit: 10 });
        if (!channels) return null;

        return channels.data.map(e => {
            return {
                "display_name": e.displayName,
                "id": e.id,
                "name": e.name,
                "thumbnail_url": e.thumbnailUrl,
            };
        });
    };

    getUserByName = async (userName: string) => {
        const user = await this.apiClient!.users.getUserByName(userName);
        if (!user) return null;

        return user;
    };

    getUserById = async (userid: string) => {
        const user = await this.apiClient!.users.getUserById(userid);
        if (!user) return null;

        return user;
    };

    registerTwitchEventSubListener = async (srv: Express) => {
        this.middleware = new EventSubMiddleware({
            apiClient: this.apiClient!,
            hostName: this._apiManager.config.hostname,
            pathPrefix: "/twitch/events",
            secret: this.signingSecret,
        });

        await this.middleware.apply(srv);
    };

    startEventSubListener = async () => {
        // When API is fully started, load all twitch event subs again
        await this.middleware!.markAsReady();

        logger.log(`Loading ${this.twitch_subscriptions.length} twitch user subscriptions...`);
        // eslint-disable-next-line no-unused-vars
        for (const e of this.twitch_subscriptions) {
            // await this.addTwitchStreamOnlineEventSub(e);
        }
    };

    addTwitchStreamOnlineEventSub = async (userId: string, guildId = null) => {
        try {
            if (!Object.hasOwnProperty.call(this.twitch_eventsubs, userId)) this.twitch_eventsubs[`${userId}`] = await this.middleware!.subscribeToStreamOnlineEvents(userId, event => this.sendStreamOnlineNotification(event));
            if (!guildId) return true;

            if (!Object.hasOwnProperty.call(this.guild_twitch_subscriptions, guildId) || !this.guild_twitch_subscriptions[guildId].includes(userId)) {
                this.guild_twitch_subscriptions[guildId].push(userId);

                // Write to db
                if (!(await this._apiManager.dbHandler.guildSettings.setDBGuildSetting(guildId, "twitch_subscriptions", this.guild_twitch_subscriptions[guildId]))) return false;
                if (!this.twitch_subscriptions.includes(userId)) this.twitch_subscriptions.push(userId);

                return true;
            }
            return true;
        } catch (ex) {
            return false;
        }
    };

    // @ts-ignore
    // eslint-disable-next-line no-unused-vars,no-empty-function
    removeTwitchStreamOnlineEventSub = async (userId, force = false) => {

    };
}