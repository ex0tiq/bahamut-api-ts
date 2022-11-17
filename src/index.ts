import ShardingServer from "./modules/ShardingServer";

process.env.TZ = "UTC";

// Load API Handler
import APIHandler from "./modules/APIHandler";
import APIBroadcastHandler from "./modules/APIBroadcastHandler";
import DBHandler from "./modules/DBHandler";
//const TwitchHandler = require("./modules/TwitchHandler");

// Log startup
console.log(`Running Bahamut API v${process.env.npm_package_version} on Node ${process.version}.`);

export class BahamutAPIHandler {
    private _startTime = Date.now();
    private _config = require("../config/api_config.json");
    // Object which contains all registered app servers
    private _registeredShardingServers: Map<string, ShardingServer> = new Map();
    // Contains all managed users
    private _managedUsers = new Map();
    // Contains the handler for all database stuff
    private readonly _dbHandler;
    private readonly _apiHandler;
    private readonly _broadcastHandler;
    //private readonly _twitchHandler;

    constructor() {
        // Init db
        this._dbHandler = new DBHandler(this);
        this._dbHandler.dbInit();
        // Init api server
        this._apiHandler = new APIHandler(this);
        // Load broadcast functions
        this._broadcastHandler = new APIBroadcastHandler(this);
        //this._twitchHandler = new TwitchHandler(this);

        //this._twitchHandler.loadAllTwitchSubscriptions();

    }

    public get startTime() {
        return this._startTime;
    }
    public get config() {
        return this._config;
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
    //public get twitchHandler() {
    //    return this._twitchHandler;
    //}
}

// Start server
new BahamutAPIHandler();