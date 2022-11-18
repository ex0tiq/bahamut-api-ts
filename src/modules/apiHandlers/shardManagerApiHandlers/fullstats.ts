import APIHandler from "../../APIHandler";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";
import { fromObject, toProperCase } from "../../../lib/toolFunctions";

const { parseBool } = require("../../../lib/parseFunctions");
const { isBool } = require("../../../lib/validateFunctions");

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/fullstats", async (req, res) => {
        const detailed = (req.query.detailed && isBool(req.query.detailed) ? parseBool(req.query.detailed) : false),
            locationSeparated = (req.query.locationSeparated && isBool(req.query.locationSeparated) ? parseBool(req.query.locationSeparated) : false);

        const data = await getShardStats(detailed, locationSeparated);

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: data,
        }));
    });

    const getShardStats = async (detailed = false, locationSeparated = false) => {
        let srvData = [], temp = null;

        if (detailed) {
            temp = (await apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient) => {
                return {
                    shardId: _client.shardId,
                    guildCount: _client.guilds.cache.size,
                    membersTotal: _client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                    channelCount: _client.channels.cache.size,
                    totalMusicQueues: _client.bahamut.musicHandler.manager.players.size,
                    playingMusicQueues: _client.bahamut.musicHandler.manager.players.reduce((a, q) => a + ((q.playing || !q.paused) ? 1 : 0), 0),
                    uptime: _client.uptime,
                    time: Date.now(),
                };
            }, true, {}, true));
        } else {
            temp = (await apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient) => {
                return {
                    shardId: _client.shardId,
                    guildCount: _client.guilds.cache.size,
                    membersTotal: _client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                    channelCount: _client.channels.cache.size,
                    uptime: _client.uptime,
                    time: Date.now(),
                };
            }, true, {}, true));
        }

        for (const t of temp) {
            const server = fromObject(t.server, ["managedGuilds", "managedShards", "ip", "port", "communication_token"]);
            let tmp = { data: { result: null } };

            if (detailed) {
                tmp = (await apiHandler.manager.broadcastHandler.broadcastToShardman(async () => {
                    const osu = require("node-os-utils"),
                        mem = await osu.mem.used();

                    return {
                        "cpuUsage": await osu.cpu.usage(),
                        "ramUsed": mem.usedMemMb,
                        "ramTotal": mem.totalMemMb,
                    };
                }, t.server.id));
            }

            const data = {
                // eslint-disable-next-line no-unused-vars
                server: ((tmp && tmp.data && tmp.data.result) ? Object.assign(server, tmp.data.result) : server),
                localTime: t.timeInfo.localTime,
                startupTime: t.timeInfo.startupTime,
                shards: t.origResult,
            };
            if (data.shards) data.shards.sort((a: { shardId: number; }, b: { shardId: number; }) => a.shardId - b.shardId);

            srvData.push(data);
        }

        if (locationSeparated) srvData = groupBy(srvData, "serverLocation", true);

        if (detailed) {
            return {
                "commandsExecutedCount": (await apiHandler.manager.dbHandler.commandLog.getDBFullCommandLogCount()) || 0,
                "playedSongsCount": (await apiHandler.manager.dbHandler.userStats.getDBGuildUserStatsSUM(["played_songs"])).get("played_songs") || 0,
                "servers": srvData,
            };
        } else {
            return {
                "servers": srvData,
            };
        }
    };

    const groupBy = (array: any[], key: string, properCaseKey = false) => {

        // Return the end result
        return array.reduce((result, currentValue) => {
            let newKey = currentValue["server"][key];
            if (properCaseKey) newKey = toProperCase(newKey);

            // If an array already present for key, push it to the array. Else create an array and push the object
            (result[newKey] = result[newKey] || []).push(
                currentValue
            );
            // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
            return result;
        }, {});
    };
};