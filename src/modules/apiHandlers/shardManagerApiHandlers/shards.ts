import APIHandler from "../../APIHandler";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/shards", async (req, res) => {
        const shardData = (await apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient) => {
            return {
                shardId: _client.shardId,
                guildCount: _client.guilds.cache.size,
                membersTotal: _client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                channelCount: _client.channels.cache.size,
                ramUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                uptime: _client.uptime,
                time: Date.now(),
                totalMusicQueues: _client.bahamut.musicHandler.manager.players.size,
                playingMusicQueues: _client.bahamut.musicHandler.manager.players.reduce((a, q) => a + ((q.playing || !q.paused) ? 1 : 0), 0),
            };
        }));
        for (let i = 0; i < shardData.length; i++) {
            shardData[i] = shardData[i].sort((a: { shardId: number; }, b: { shardId: number; }) => a.shardId - b.shardId);
        }

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: shardData,
        }));
    });
};