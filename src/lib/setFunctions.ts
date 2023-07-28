import { BahamutAPIHandler } from "../index.js";

const setLatestLodestoneNews = async (manager: BahamutAPIHandler, latestTopic?: string,
                                      latestNotice?: string,
                                      latestMaintenance?: string,
                                      latestUpdate?: string,
                                      latestStatus?: string,
                                      latestDeveloper?: string,
) => {
    try {
        if (latestTopic) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneTopic", latestTopic, "string");
        if (latestNotice) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneNotice", latestNotice, "string");
        if (latestMaintenance) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneMaintenance", latestMaintenance, "string");
        if (latestUpdate) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneUpdate", latestUpdate, "string");
        if (latestStatus) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneStatus", latestStatus, "string");
        if (latestDeveloper) await manager.dbHandler.guildSettings.setDBGuildSetting("global", "lastLodestoneDeveloper", latestDeveloper, "string");
    } catch (ex) {
        console.error("Error setting latest lodestone news:", ex);
        return false;
    }
};

export { setLatestLodestoneNews };