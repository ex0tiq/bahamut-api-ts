import scheduler, { Job } from "node-schedule";
import logger from "./Logger";
import { getLatestLodestoneNews } from "../lib/getFunctions";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";
import { setLatestLodestoneNews } from "../lib/setFunctions";
import { BahamutAPIHandler } from "../index";

export default class GlobalSchedulers {
    private _apiHandler;

    // Set node-schedule object
    private _scheduler: typeof scheduler = scheduler;
    private _schedules: Map<string, Job> = new Map<string, Job>;

    constructor(apiHandler: BahamutAPIHandler) {
        this._apiHandler = apiHandler;

        this._scheduler.scheduleJob("*/10 * * * *", async () => {
            try {
                logger.log("Running lodestone news scheduler.");

                const latestLodestonePosts = await getLatestLodestoneNews(this._apiHandler);
                if (!latestLodestonePosts) return;

                await this._apiHandler.broadcastHandler.broadcastToAll(async (_client: BahamutClient, obj: any) => {
                    const { getGuildSettings } = require(obj.rootPath + "/lib/getFunctions");

                    // Flatten array and sort by date
                    const { DateTime } = require("luxon");
                    let arr: any[] = (Object.values(obj.latestPosts)).flat();

                    if (arr.length <= 0) return;

                    arr = arr.sort((a1, a2) => {
                        return DateTime.fromISO(a1.time) - DateTime.fromISO(a2.time);
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
    }

    public get scheduler() {
        return this._scheduler;
    }

    public get schedules() {
        return this._schedules;
    }


}