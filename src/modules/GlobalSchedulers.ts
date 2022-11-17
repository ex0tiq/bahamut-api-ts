import APIHandler from "./APIHandler";
import scheduler, { Job } from "node-schedule";
import logger from "./Logger";
import { getLatestLodestoneNews } from "../lib/getFunctions";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

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

                this._apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient, obj: any) => {
                    // TODO Implement additional check for enabled lodestone notification categories

                    // Flatten array and sort by date
                    const { flattenArray } = require("../lib/toolFunctions");
                    const { DateTime } = require("luxon");
                    let arr = flattenArray(obj.latestPosts);

                    if (arr.length <= 0) return;

                    arr = arr.sort((a1: { time: any; }, a2: { time: any; }) => {
                        return DateTime.fromISO(a2.time) - DateTime.fromISO(a1.time);
                    });

                    for (const e of arr) {
                        // Post all entries

                    }

                }, false, { latestPosts: latestLodestonePosts }, false);


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