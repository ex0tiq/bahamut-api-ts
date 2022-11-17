import APIHandler from "../../APIHandler";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/stats", async (req, res) => {
        const data = await getTotalStats();

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: data,
        }));
    });

    const getTotalStats = async () => {
        let result = [];
        for (const [, srv] of apiHandler.manager.registeredShardingServers.entries()) {
            result.push(srv.managedGuilds);
        }
        result = result.flat().sort((a, b) => a.name.localeCompare(b.name));

        const data = (await apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient) => {
            return {
                shardId: _client.shardId,
                guildCount: _client.guilds.cache.size,
                membersTotal: _client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                channelCount: _client.channels.cache.size,
            };
        })).flat();

        return {
            "guildCount": data.reduce((a, s) => a + s.guildCount, 0),
            "membersTotal": data.reduce((a, s) => a + s.membersTotal, 0),
            "channelCount": data.reduce((a, s) => a + s.channelCount, 0),
        };
    };
};