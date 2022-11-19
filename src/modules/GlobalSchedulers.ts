import APIHandler from "./APIHandler";
import scheduler, { Job } from "node-schedule";
import logger from "./Logger";
import { getLatestLodestoneNews } from "../lib/getFunctions";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";
import { setLatestLodestoneNews } from "../lib/setFunctions";

export default class GlobalSchedulers {
    private _apiHandler;

    // Set node-schedule object
    private _scheduler: typeof scheduler = scheduler;
    private _schedules: Map<string, Job> = new Map<string, Job>;

    constructor(apiHandler: APIHandler) {
        this._apiHandler = apiHandler;

        this._scheduler.scheduleJob("*/10 * * * *", async () => {
            try {
                logger.log("Running lodestone news scheduler.");

                const latestLodestonePosts = await getLatestLodestoneNews(this._apiHandler.manager);
                if (!latestLodestonePosts) return;


                await this._apiHandler.manager.broadcastHandler.broadcastToAll(async (_client: BahamutClient, obj: any) => {
                    const { getGuildSettings } = require(obj.rootPath + "/lib/getFunctions");

                    // Flatten array and sort by date
                    const { DateTime } = require("luxon");
                    let arr = obj.latestPosts.flat();

                    if (arr.length <= 0) return;

                    arr = arr.sort((a1: { time: any; }, a2: { time: any; }) => {
                        return DateTime.fromISO(a2.time) - DateTime.fromISO(a1.time);
                    });

                    for (const [, guild] of _client.guilds.cache) {
                        // TODO Implement additional check for enabled lodestone notification categories
                        // filter for type on message object
                        const sendMessages = obj.latestPosts;

                        const guild_settings = await getGuildSettings(_client, guild);

                        // Skip of guild has no lofestone news channel set
                        if (!guild_settings.ffxiv_lodestone_news_channel || !guild.channels.cache.has(guild_settings.ffxiv_lodestone_news_channel)) continue;
                        const lodestone_channel = guild.channels.cache.get(guild_settings.ffxiv_lodestone_news_channel);

                        if (!lodestone_channel) return null;

                        try {
                            for (const m of obj.sendMessages) {
                                // @ts-ignore
                                await lodestone_channel.send(m);
                            }
                        } catch (ex) {
                            console.error("Unable to post to lodestone channel:", ex);
                        }

                    }

                }, false, { latestPosts: latestLodestonePosts }, false);

                // set last lodestone ids
                await setLatestLodestoneNews(this._apiHandler.manager,
                    latestLodestonePosts.topics[latestLodestonePosts.topics.length - 1],
                    latestLodestonePosts.notices[latestLodestonePosts.notices.length - 1],
                    latestLodestonePosts.maintenance[latestLodestonePosts.maintenance.length - 1],
                    latestLodestonePosts.updates[latestLodestonePosts.updates.length - 1],
                    latestLodestonePosts.status[latestLodestonePosts.status.length - 1],
                    latestLodestonePosts.developers[latestLodestonePosts.developers.length - 1]
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