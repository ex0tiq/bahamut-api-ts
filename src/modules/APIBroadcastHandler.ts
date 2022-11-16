import axios from "axios";
import { ManagedGuild, ShardingServer } from "../../typings";
import { BahamutShardingBootManager } from "bahamutbot";
import { BahamutAPIHandler } from "../index";

export default class APIBroadcastHandler {
    private _apiHandler: BahamutAPIHandler;

    constructor(handler: BahamutAPIHandler) {
        this._apiHandler = handler;
    }

    /**
     *
     * @param {function} code
     * @param {boolean} includeTimeInformation
     * @param additionalContextAttributes
     * @param includeServerObject
     * @returns
     */
    broadcastToAll = async (code: Function, includeTimeInformation = false, additionalContextAttributes: any = {}, includeServerObject = false) => {
        const temp = [];

        // eslint-disable-next-line no-unused-vars
        for (const [, srv] of this._apiHandler.registeredShardingServers) {
            // Send request to server
            try {
                const codeString = code.toString();

                let url = `http://${srv.ip}:${srv.port}/broadcast?communication_token=${srv.communication_token}`;
                if (includeTimeInformation) url += "&includeTimeInformation=true";

                const resp = await axios(url, {
                    method: "POST",
                    data: {
                        code: codeString,
                        additionalContext: additionalContextAttributes,
                    },
                    timeout: 2000,
                });

                if (resp && resp.data) {
                    const resObj = resp.data.result;
                    if (includeServerObject) resObj.server = srv;
                    temp.push(resObj);
                    // if (Array.isArray(resp.data.result)) temp.push(resp.data.result[0]);
                    // else temp.push(resp.data.result);
                }
            } catch (ex) {
                console.error(ex);
            }
        }

        return temp;
    };

    /**
     *
     * @param {function} code
     * @param {string} guild
     * @param {boolean} includeTimeInformation
     * @param additionalContextAttributes
     * @param includeServerObject
     * @returns
     */
    broadcastToGuild = async (code: Function, guild: string | null = null, includeTimeInformation = false, additionalContextAttributes: any = {}, includeServerObject = false) => {
        if (!guild) return null;
        const temp = [];

        // eslint-disable-next-line no-unused-vars
        for (const [, srv] of this._apiHandler.registeredShardingServers) {
            if (!Array.isArray(srv.managedGuilds)) continue;
            // Send request to server
            if (srv.managedGuilds.has(guild)) {
                try {
                    const codeString = code.toString();

                    let url = `http://${srv.ip}:${srv.port}/broadcast?communication_token=${srv.communication_token}`;
                    if (includeTimeInformation) url += "&includeTimeInformation=true";

                    const resp = await axios(url, {
                        method: "POST",
                        data: {
                            code: codeString,
                            guild: guild,
                            additionalContext: additionalContextAttributes,
                        },
                        timeout: 2000,
                    });

                    if (resp && resp.data) {
                        const resObj = resp.data.result;
                        if (includeServerObject) resObj.server = srv;
                        temp.push(resObj);
                        // if (Array.isArray(resp.data.result)) temp.push(resp.data.result[0]);
                        // else temp.push(resp.data.result);
                    }
                } catch (ex) {
                    console.error(ex);
                }
            }
        }

        return temp;
    };

    /**
     *
     * @param {function} code
     * @param {number} shard
     * @param {boolean} includeTimeInformation
     * @param additionalContextAttributes
     * @param includeServerObject
     * @returns
     */
    broadcastToShard = async (code: Function, shard: number | null = null, includeTimeInformation = false, additionalContextAttributes: any = {}, includeServerObject = false) => {
        if (!shard && shard !== 0) return null;

        const temp = [];

        // eslint-disable-next-line no-unused-vars
        for (const [, srv] of this._apiHandler.registeredShardingServers) {
            // Send request to server
            if (srv.managedShards.has(shard)) {
                try {
                    const codeString = code.toString();

                    let url = `http://${srv.ip}:${srv.port}/broadcast?communication_token=${srv.communication_token}`;
                    if (includeTimeInformation) url += "&includeTimeInformation=true";

                    const resp = await axios(url, {
                        method: "POST",
                        data: {
                            code: codeString,
                            shard: shard,
                            additionalContext: additionalContextAttributes,
                        },
                        timeout: 2000,
                    });

                    if (resp && resp.data) {
                        const resObj = resp.data.result;
                        if (includeServerObject) resObj.server = srv;
                        temp.push(resObj);
                        // if (Array.isArray(resp.data.result)) temp.push(resp.data.result[0]);
                        // else temp.push(resp.data.result);
                    }
                } catch (ex) {
                    console.error(ex);
                }
            }
        }

        return temp;
    };

    broadcastToShardman = async (code: Function, serverId: string | null = null, additionalContextAttributes: any = {}) => {
        // const srv = this.getLowestLatencyServer();

        const temp = [];

        for (const [, srv] of this._apiHandler.registeredShardingServers) {
            if (serverId && serverId !== srv.id) continue;

            // Send request to server
            try {
                const codeString = code.toString(),
                    url = `http://${srv.ip}:${srv.port}/broadcast?communication_token=${srv.communication_token}`;

                const resp = await axios(url, {
                    method: "POST",
                    data: {
                        code: codeString,
                        additionalContext: additionalContextAttributes,
                    },
                    timeout: 2000,
                });

                if (resp) {
                    if (Array.isArray(resp)) temp.push(resp[0]);
                    else temp.push(resp);
                }
            } catch (ex) {
                console.error(ex);
            }
        }

        return (serverId ? temp[0] : temp);
    };

    getLowestLatencyServer = () => {
        let res: ShardingServer | null = null;

        this._apiHandler.registeredShardingServers.forEach((srv) => {
            if (!res) {
                res = srv;
            } else if (srv.latency < res.latency) {
                res = srv;
            }
        });

        return res;
    };

    getServerOfGuild = (guild: string) => {
        if (this._apiHandler.registeredShardingServers.size <= 0) return null;

        for (const [, srv] of this._apiHandler.registeredShardingServers.entries()) {
            if (srv.managedGuilds.has(guild)) {
                return srv;
            }
        }

        return null;
    };

    getServerManagedUsers = async (server_id: string) => {
        const data = (await this.broadcastToShardman(async (_manager: BahamutShardingBootManager) => {
            return _manager.fn.getManagedUsers();
        }, server_id)).flat();
        return data;
    };

    getAllManagedGuilds = (): ManagedGuild[] => {
        const result = [];
        for (const [, srv] of this._apiHandler.registeredShardingServers) {
            result.push(...srv.managedGuilds.values());
        }
        return result.flat().sort((a, b) => a.name.localeCompare(b.name));
    };
    getManagedGuilds = (startId: string | null = null, limit = 25) => {
        const result = this.getAllManagedGuilds();
        let startIndex = 0;

        if (startId !== null) startIndex = result.findIndex(i => i.id === startId) || 0;

        return result.slice(startIndex, limit);
    };
}