import { BahamutAPIHandler } from "../index";

const setLatestLodestoneNews = async (manager: BahamutAPIHandler, latestTopic: string,
                                      latestNotice: string,
                                      latestMaintenance: string,
                                      latestUpdate: string,
                                      latestStatus: string,
                                      latestDeveloper: string,
) => {
    try {
        const lastLodestonePosts = {
            topics: latestTopic,
            notices: latestNotice,
            maintenance: latestMaintenance,
            updates: latestUpdate,
            status: latestStatus,
            developers: latestDeveloper,
        };

        await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestonePosts", JSON.stringify(lastLodestonePosts), "json");
        return true;
    } catch (ex) {
        console.error("Error setting latest lodestone news:", ex);
        return false;
    }
};

export { setLatestLodestoneNews };