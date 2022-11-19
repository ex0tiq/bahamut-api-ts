import axios from "axios";
import { BahamutAPIHandler } from "../index";
import { GlobalGuildSettings, LodestoneNewsData } from "../../typings";
import { EmbedBuilder } from "discord.js";

const getLatestLodestoneNews = async (manager: BahamutAPIHandler) => {
    try {
        const lastLodestoneUpdates = await axios("https://lodestonenews.com/news/all?limit=10&locale=eu", {
                method: "GET",
                timeout: 3000,
            }),
            entries: LodestoneNewsData | null = lastLodestoneUpdates.data || null,
            entriesToPost: {
                topics: any[],
                notices: any[],
                maintenance: any[],
                updates: any[],
                status: any[],
                developers: any[],
            } = {
                topics: [],
                notices: [],
                maintenance: [],
                updates: [],
                status: [],
                developers: [],
            };

        // If no results, abort
        if (!lastLodestoneUpdates || !entries) return null;

        // Get last posted ids
        const globalSetting: GlobalGuildSettings | null = <GlobalGuildSettings | null>await manager.dbHandler.guildSettings.getDBGuildSettings("global");
        if (!globalSetting) return entriesToPost;

        if ("topics" in entries) {
            const temp = entries.topics.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.topics);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.topics.push({
                    type: "topic",
                    id: e.id,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Topics", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/topics.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .setURL(e.url)
                        .setDescription(e.description)
                        .setImage(e.image)
                        .toJSON(),
                });
            }
        }
        if ("notices" in entries) {
            const temp = entries.notices.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.notices);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.notices.push({
                    type: "notice",
                    id: e.id,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Notices", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/notices.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .setURL(e.url)
                        .toJSON(),
                });
            }
        }
        if ("maintenance" in entries) {
            const temp = entries.maintenance.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.maintenance);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.maintenance.push({
                    type: "maintenance",
                    id: e.id,
                    start: e.start,
                    end: e.end,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Maintenance", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/maintenance.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .toJSON(),
                });
            }
        }
        if ("updates" in entries) {
            const temp = entries.updates.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.updates);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.updates.push({
                    type: "update",
                    id: e.id,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Updates", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/updates.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .setURL(e.url)
                        .toJSON(),
                });
            }
        }
        if ("status" in entries) {
            const temp = entries.status.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.status);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.status.push({
                    type: "status",
                    id: e.id,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Status", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/status.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .setURL(e.url)
                        .toJSON(),
                });
            }
        }
        if ("developers" in entries) {
            const temp = entries.developers.reverse(),
                lastIndex = temp.findIndex((e: any) => e.id === globalSetting.lastLodestonePosts.developers);

            for (const e of temp.slice(lastIndex < 0 ? (temp.length - 1) : lastIndex)) {
                entriesToPost.developers.push({
                    type: "developer",
                    id: e.id,
                    embed: new EmbedBuilder()
                        .setAuthor({ name: "Developer's Blog", iconURL: "https://teraflare.app/assets/bot_assets/lodestone-images/developers.png" })
                        .setColor(manager.globalConfig.primary_message_color)
                        .setTitle(e.title)
                        .setURL(e.url)
                        .setDescription(e.description)
                        .toJSON(),
                });
            }
        }

        return entriesToPost;
    } catch (ex) {
        console.error("Error fetching latest lodestone news:", ex);
        return null;
    }
};

export { getLatestLodestoneNews };