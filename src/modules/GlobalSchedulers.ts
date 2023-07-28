import scheduler, { Job } from "node-schedule";
import logger from "./Logger.js";
import { getLatestLodestoneNews } from "../lib/getFunctions.js";
import BahamutClient from "bahamutbot/src/modules/BahamutClient.js";
import { setLatestLodestoneNews } from "../lib/setFunctions.js";
import { BahamutAPIHandler } from "../index.js";
import axios from "axios";
import { DateTime } from "luxon";
import { GlobalGuildSettings } from "../../typings.js";

export default class GlobalSchedulers {
    private _apiHandler;

    // Set node-schedule object
    private _scheduler: typeof scheduler = scheduler;
    private _schedules: Map<string, Job> = new Map<string, Job>;

    constructor(apiHandler: BahamutAPIHandler) {
        this._apiHandler = apiHandler;

        // Lodestone task
        this._scheduler.scheduleJob("*/10 * * * *", async () => {
            try {
                logger.log("Running lodestone news scheduler.");

                const latestLodestonePosts = await getLatestLodestoneNews(this._apiHandler);
                if (!latestLodestonePosts) return;

                await this._apiHandler.broadcastHandler.broadcastToAll(async (_client: BahamutClient, obj: any) => {
                    const { getGuildSettings } = await import(obj.rootPath + "/lib/getFunctions.js");

                    // Flatten array and sort by date
                    // eslint-disable-next-line no-shadow
                    const { DateTime } = await import("luxon");
                    let arr: any[] = (Object.values(obj.latestPosts)).flat();

                    if (arr.length <= 0) return;

                    arr = arr.sort((a1, a2) => {
                        return DateTime.fromISO(a1.time).toMillis() - DateTime.fromISO(a2.time).toMillis();
                    });

                    for (const [, guild] of _client.guilds.cache) {
                        // TODO Implement additional check for enabled lodestone notification categories
                        const guild_settings = await getGuildSettings(_client, guild);

                        // Skip of guild has no lodestone news channel set
                        if (!guild_settings.ffxiv_lodestone_news_channel || !guild.channels.cache.has(guild_settings.ffxiv_lodestone_news_channel)) continue;
                        const lodestone_channel = guild.channels.cache.get(guild_settings.ffxiv_lodestone_news_channel);
                        if (!lodestone_channel) return null;

                        const sendMessages = [ ...arr ];
                        // filter for enabled types on message object

                        try {
                            for (const m of sendMessages) {
                                if (m.type === "maintenance") {
                                    m.embed.fields = [
                                        { name: "Start", value: `\`${DateTime.fromISO(m.start).setLocale(guild_settings.language).toLocaleString(DateTime.DATETIME_MED)}\``, inline: true },
                                        { name: "End", value: `\`${DateTime.fromISO(m.end).setLocale(guild_settings.language).toLocaleString(DateTime.DATETIME_MED)}\``, inline: true },
                                    ];
                                }
                                // @ts-ignore
                                await lodestone_channel.send({
                                    embeds: [ m.embed ],
                                });
                            }
                        } catch (ex) {
                            console.error("Unable to post to lodestone channel:", ex);
                        }

                    }

                }, false, { latestPosts: latestLodestonePosts }, false);

                // set last lodestone ids
                await setLatestLodestoneNews(this._apiHandler,
                    latestLodestonePosts.topics[latestLodestonePosts.topics.length - 1]?.id || undefined,
                    latestLodestonePosts.notices[latestLodestonePosts.notices.length - 1]?.id || undefined,
                    latestLodestonePosts.maintenance[latestLodestonePosts.maintenance.length - 1]?.id || undefined,
                    latestLodestonePosts.updates[latestLodestonePosts.updates.length - 1]?.id || undefined,
                    latestLodestonePosts.status[latestLodestonePosts.status.length - 1]?.id || undefined,
                    latestLodestonePosts.developers[latestLodestonePosts.developers.length - 1]?.id || undefined
                );
            } catch (ex) {
                console.error(ex);
            }
        });

        // Reddit fashion report task
        this._scheduler.scheduleJob("0,30 * * * *", async () => {
            try {
                logger.log("Running fashion report scheduler.");

                const settings: GlobalGuildSettings | null = <GlobalGuildSettings | null>await this._apiHandler.dbHandler.guildSettings.getDBGuildSettings("global");
                if (!settings) return null;

                let res = await axios.request({
                    url: "https://reddit.com/r/ffxiv/search.json",
                    params: {
                        "q": "author:kaiyoko title:\"Fashion Report - Full Details\"",
                        "sort": "new",
                        "limit": 3,
                    },
                });

                if (res && res.data) res = res.data;
                else return;

                if (res && res.data && res.data.children) res = res.data.children.map((e: { data: any; }) => e.data);
                else return;

                // Abort if no post found
                if (!res || !Array.isArray(res) || res.length <= 0) return;
                // Abort if post title does not match fashion report schema
                if (!res[0].title.toLowerCase().match(/.*Fashion Report - Full Details.*/gi)) return;
                // Abort current check if no new fashion report found
                if ((res[0] && res[0].id) && (settings && settings.lastFashionReport && settings.lastFashionReport === res[0].id)) return;

                const date = res[0].title.match(/\d{1,2}\/\d{1,2}\/\d{1,4}/);

                if (Array.isArray(date) && date.length > 0 && (settings && settings.lastFashionReportDate && settings.lastFashionReportDate === date[0])) return;
                if (settings && settings.lastFashionReportDate && (DateTime.fromFormat(date[0], "M/d/yyyy") <= DateTime.fromFormat(settings.lastFashionReportDate, "M/d/yyyy"))) return;

                await this._apiHandler.broadcastHandler.broadcastToAll(async (_client: BahamutClient, obj: any) => {
                    for (const [, guild] of _client.guilds.cache) {
                        const { getGuildSettings } = await import(obj.rootPath + "/lib/getFunctions.js");

                        const guild_settings = await getGuildSettings(_client, guild),
                            { EmbedBuilder } = await import("discord.js");

                        if (!guild_settings.ffxiv_fashion_report_channel || !guild.channels.cache.has(guild_settings.ffxiv_fashion_report_channel)) continue;
                        const fashionreport_channel = guild.channels.cache.get(guild_settings.ffxiv_fashion_report_channel);

                        if (obj.post) {
                            // @ts-ignore
                            await fashionreport_channel!.send({ embeds: [(new EmbedBuilder()
                                        .setTitle(obj.post.title)
                                        // @ts-ignore
                                        .setColor(_client.bahamut.config.primary_message_color)
                                        .setImage(obj.post.url)
                                        .setURL("https://reddit.com" + obj.post.permalink)
                                )] });
                        }
                    }
                }, false, { post: res[0] });

                // Update last fashion report
                await this._apiHandler.dbHandler.guildSettings.setDBGuildSetting("global", "lastFashionReport", res[0].id, "string");
                if (Array.isArray(date) && date.length > 0) await this._apiHandler.dbHandler.guildSettings.setDBGuildSetting("global", "lastFashionReportDate", date[0], "string");
            } catch (ex) {
                console.error(ex);
            }
        });

        this._scheduler.scheduleJob("15,45 * * * *", async () => {
            try {
                logger.log("Running island sanctuary news scheduler.");

                const settings: GlobalGuildSettings | null = <GlobalGuildSettings | null>await this._apiHandler.dbHandler.guildSettings.getDBGuildSettings("global");
                if (!settings) return null;

                let res = await axios.request({
                    url: "https://reddit.com/r/ffxiv/search.json",
                    params: {
                        "q": "author:Sewer-Rat title:\"Island Sanctuary Workshop - Season\"",
                        "sort": "new",
                        "limit": 3,
                    },
                });

                if (res && res.data) res = res.data;
                else return;

                if (res && res.data && res.data.children) res = res.data.children.map((e: { data: any; }) => e.data);
                else return;

                // Abort if no post found
                if (!res || !Array.isArray(res) || res.length <= 0) return;
                // Abort if post title does not match schema
                if (!res[0].title.toLowerCase().match(/.*Island Sanctuary Workshop - Season.*/gi)) return;
                // Abort current check if no new report found
                if ((res[0] && res[0].id) && (settings && settings.lastIslandNews && settings.lastIslandNews === res[0].id)) return;

                const season = res[0].title.match(/\d{1,2}/);

                if (Array.isArray(season) && season.length > 0 && (settings && settings.lastIslandSeason && settings.lastIslandSeason === season[0])) return;
                if (settings && settings.lastIslandSeason && (parseInt(season[0]) <= parseInt(settings.lastIslandSeason))) return;

                await this._apiHandler.broadcastHandler.broadcastToAll(async (_client: BahamutClient, obj: any) => {
                    for (const [, guild] of _client.guilds.cache) {
                        const { getGuildSettings } = await import(obj.rootPath + "/lib/getFunctions");

                        const guild_settings = await getGuildSettings(_client, guild),
                            { EmbedBuilder } = await import("discord.js");

                        if (!guild_settings.ffxiv_island_news_channel || !guild.channels.cache.has(guild_settings.ffxiv_island_news_channel)) continue;
                        const island_channel = guild.channels.cache.get(guild_settings.ffxiv_island_news_channel);

                        if (obj.post) {
                            // @ts-ignore
                            await island_channel!.send({ embeds: [(new EmbedBuilder()
                                        .setTitle(obj.post.title)
                                        // @ts-ignore
                                        .setColor(_client.bahamut.config.primary_message_color)
                                        .setDescription(obj.post.selftext.includes("FAQ") ? `${obj.post.selftext.split("\n\n# FAQ")[0]}` : `${obj.post.selftext.substring(0, 500)}...`)
                                        .setURL("https://reddit.com" + obj.post.permalink)
                                )] });
                        }
                    }
                }, false, { post: res[0] });

                // Update last island news
                await this._apiHandler.dbHandler.guildSettings.setDBGuildSetting("global", "lastIslandNews", res[0].id, "string");
                if (Array.isArray(season) && season.length > 0) await this._apiHandler.dbHandler.guildSettings.setDBGuildSetting("global", "lastIslandSeason", season[0], "string");
            } catch (ex) {
                console.error(ex);
            }
        });
    }

    public get scheduler() {
        return this._scheduler;
    }

    public get schedules() {
        return this._schedules;
    }


}