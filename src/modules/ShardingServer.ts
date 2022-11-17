import { ManagedGuild, ManagedShard, ShardingServerConfig } from "../../typings";
import { toProperCase } from "../lib/toolFunctions";

export default class ShardingServer {
    private readonly _id: string;
    private readonly _ip: string;
    private readonly _port: number;
    private readonly _communication_token: string;
    private readonly _lastMessageTime: number;
    private _managedGuilds: ManagedGuild[];
    private _managedShards: ManagedShard[];
    private readonly _startupTime: number;
    private readonly _currentServerTime: number;
    private readonly _latency: number;
    private readonly _serverLocation: string;

    constructor(json: ShardingServerConfig, ip: string) {
        this._id = json.serverId;
        this._ip = ip;
        this._port = json.port;
        this._communication_token = json.communication_token;
        this._lastMessageTime = Date.now();
        this._startupTime = json.startupTime;
        this._currentServerTime = json.currentTime;
        this._latency = (Date.now() - json.currentTime);
        this._serverLocation = toProperCase(json.serverLocation);

        this._managedShards = json.managedShards;
        this._managedGuilds = Array.isArray(this._managedShards) ? this._managedShards.map(e => e.guilds).flat() : [];
    }

    public get id() {
        return this._id;
    }
    public get ip() {
        return this._ip;
    }
    public get port() {
        return this._port;
    }
    public get communication_token() {
        return this._communication_token;
    }
    public get lastMessageTime() {
        return this._lastMessageTime;
    }
    public get managedShards() {
        return this._managedShards;
    }
    public get managedGuilds() {
        return this._managedGuilds;
    }
    public get startupTime() {
        return this._startupTime;
    }
    public get currentServerTime() {
        return this._currentServerTime;
    }
    public get latency() {
        return this._latency;
    }
    public get serverLocation() {
        return this._serverLocation;
    }
}