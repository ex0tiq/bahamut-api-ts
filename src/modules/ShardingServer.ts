import { ManagedGuild, ManagedShard, ShardingServerConfig } from "../../typings";
import { toProperCase } from "../lib/toolFunctions";

export default class ShardingServer {
    readonly id: string;
    readonly ip: string;
    readonly port: number;
    readonly communication_token: string;
    readonly lastMessageTime: number;
    managedGuilds: ManagedGuild[];
    managedShards: ManagedShard[];
    readonly startupTime: number;
    readonly currentServerTime: number;
    readonly latency: number;
    readonly serverLocation: string;

    constructor(json: ShardingServerConfig, ip: string) {
        this.id = json.serverId;
        this.ip = ip;
        this.port = json.port;
        this.communication_token = json.communication_token;
        this.lastMessageTime = Date.now();
        this.startupTime = json.startupTime;
        this.currentServerTime = json.currentTime;
        this.latency = (Date.now() - json.currentTime);
        this.serverLocation = toProperCase(json.serverLocation);

        this.managedShards = json.managedShards;
        this.managedGuilds = Array.isArray(this.managedShards) ? this.managedShards.map(e => e.guilds).flat() : [];
    }
}