import axios from "axios";
import { BahamutAPIHandler } from "../index";

const getLatestLodestoneNews = async (manager: BahamutAPIHandler) => {
    const lastLodestoneUpdates = await axios("https://lodestonenews.com/news/all?limit=10&locale=eu", {
            method: "GET",
            timeout: 3000,
        }),
        entries = lastLodestoneUpdates.data || null,
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
    if (!lastLodestoneUpdates || !entries) return entriesToPost;

    // Get last posted ids
    const globalSetting = await manager.dbHandler.guildSettings.getDBGuildSettings("global");
    if (!globalSetting) return entriesToPost;

    if ("topics" in entries) {
        const temp = entries.topics.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.topics);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.topics.push(e);
        }
    }
    if ("notices" in entries) {
        const temp = entries.notices.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.notices);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.notices.push(e);
        }
    }
    if ("maintenance" in entries) {
        const temp = entries.maintenance.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.maintenance);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.maintenance.push(e);
        }
    }
    if ("updates" in entries) {
        const temp = entries.updates.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.updates);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.updates.push(e);
        }
    }
    if ("status" in entries) {
        const temp = entries.status.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.status);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.status.push(e);
        }
    }
    if ("developers" in entries) {
        const temp = entries.developers.reverse(),
            lastIndex = temp.findIndex((e: any) => e.id === globalSetting?.last_lodestone_posts?.developers);

        for (const e of temp.slice(lastIndex < 0 ? 0 : lastIndex)) {
            entriesToPost.developers.push(e);
        }
    }

    return entriesToPost;
};

export { getLatestLodestoneNews };