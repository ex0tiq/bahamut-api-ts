import GlobalSchedulers from "./modules/GlobalSchedulers.js";

process.env.TZ = "UTC";

// Load API Handler
import APIHandler from "./modules/APIHandler.js";
import APIBroadcastHandler from "./modules/APIBroadcastHandler.js";
import DBHandler from "./modules/DBHandler.js";
import TwitchHandler from "./modules/TwitchHandler.js";
import ShardingServer from "./modules/ShardingServer.js";
import { readFileSync } from 'fs';
import { resolve } from "path";
import { APIConfig, GlobalConfig } from "../typings.js";

// Log startup
console.log(`Running Bahamut API v${process.env.npm_package_version} on Node ${process.version}.`);

export class BahamutAPIHandler {
    private _startTime = Date.now();
    private _config: APIConfig;
    private _globalConfig: GlobalConfig;
    // Object which contains all registered app servers
    private _registeredShardingServers: Map<string, ShardingServer> = new Map();
    // Contains all managed users
    private _managedUsers = new Map();
    // Contains the handler for all database stuff
    private readonly _dbHandler;
    private readonly _apiHandler;
    private readonly _broadcastHandler;
    private readonly _twitchHandler;

    constructor() {
        this._config = JSON.parse(
            readFileSync(resolve("config/api_config.json"), "utf-8")
        );
        this._globalConfig = JSON.parse(
            readFileSync(resolve("config/global_config.json"), "utf-8")
        );

        // Init db
        this._dbHandler = new DBHandler(this);
        this._dbHandler.dbInit();
        // Init api server
        this._apiHandler = new APIHandler(this);
        // Load broadcast functions
        this._broadcastHandler = new APIBroadcastHandler(this);
        this._twitchHandler = new TwitchHandler(this);

        this._twitchHandler.loadAllTwitchSubscriptions();

        // Load global schedules
        new GlobalSchedulers(this);
    }

    public get startTime() {
        return this._startTime;
    }
    public get config() {
        return this._config;
    }
    public get globalConfig() {
        return this._globalConfig;
    }
    public get registeredShardingServers() {
        return this._registeredShardingServers;
    }
    public get managedUsers() {
        return this._managedUsers;
    }
    public get dbHandler() {
        return this._dbHandler;
    }
    public get apiHandler() {
        return this._apiHandler;
    }
    public get broadcastHandler() {
        return this._broadcastHandler;
    }
    public get twitchHandler() {
        return this._twitchHandler;
    }
}

// Start server
new BahamutAPIHandler();