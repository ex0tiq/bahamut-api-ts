import express from "express";
import logger from "./Logger";
import rateLimit from "express-rate-limit";
import { promisify } from "util";
import { BahamutAPIHandler } from "../index";

const recursive = promisify(require("recursive-readdir"));
const expressDefend = require("express-defend");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
});
const defend = expressDefend.protect({
    maxAttempts: 3,
    dropSuspiciousRequest: true,
    consoleLogging: true,
    logFile: "suspicious.log",
    onMaxAttemptsReached: function(ipAddress: string, url: string) {
        console.log("IP address " + ipAddress + " is considered to be malicious, URL: " + url);
    },
});

/**
 * Class to handle all api requests
 */
export default class APIHandler {
    private readonly _apiManager: BahamutAPIHandler;
    private readonly _srv;
    private _listener: any;
    private _serverOfflineCheckerIntervalId: ReturnType<typeof setInterval> | undefined;

    constructor(apiManager: BahamutAPIHandler) {
        this._srv = express();
        this._apiManager = apiManager;

        // Interpret x-forwarded-for header
        this._srv.set("trust proxy", true);
        // Rate limit
        this._srv.use(limiter);
        // Defend
        this._srv.use(defend);
        // Support for json bodies (post)
        this._srv.use(express.json());
        // Require valid api key for every request
        this._srv.use((req, res, next) => {
            res.header("Content-Type", "application/json");

            try {
                if (req.originalUrl.length >= 1024) {
                    res.status(400);
                    res.end(JSON.stringify({
                        status: "error",
                        message: "Bad Request",
                        result: null,
                    }));
                    return;
                }

                if (!["/", "/twitch/events"].includes(req.path.trim()) && (!req.query || (!req.query.registerToken && (!req.query.private_key || this._apiManager.config.api_token !== req.query.private_key)))) {
                    res.status(403);
                    res.end(JSON.stringify({
                        status: "error",
                        message: "Access denied",
                        result: null,
                    }));
                } else {
                    let ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress;
                    if (ip?.includes(":")) {
                        const t = Array.isArray(ip) ? ip[0].split(":") : ip.split(":");
                        ip = t.slice(t.length - 2);
                        ip = ip.length > 1 ? ip[1] : ip[0];
                    }
                    if (ip!.includes(",")) {
                        // @ts-ignore
                        ip = ip!.split(",")[0];
                    }

                    const param = Object.entries(req.query)
                            .filter(([key]) => (!key.toLowerCase().includes("private_key")) && !key.toLowerCase().includes("communication_token") && !key.toLowerCase().includes("registertoken"))
                            .map(([key, val]) => `${key}=${val}`).join("&"),
                        space = " ".repeat(15 - ip!.length);

                    if (!req.originalUrl.toLowerCase().includes("_srvheartbeat")) logger.log(`[API][${ip}${space}] ${req.headers["referer"] ? (new URL(req.headers["referer"])).pathname : "/"} => ${req.path}${param ? `?${param}` : ""}`);
                    next();
                }
            } catch (ex) {
                console.log(ex);
                res.status(400);
                res.end(JSON.stringify({
                    status: "error",
                    message: "Bad Request",
                    result: null,
                }));
                return;
            }
        });
        // Abort if invalid json found
        // eslint-disable-next-line no-unused-vars
        this._srv.use((err: any, req: any, res: { status: (arg0: number) => void; end: (arg0: string) => void; }, next: any) => {
            console.log(err);
            // 'SyntaxError: Unexpected token n in JSON at position 0'
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        });

        this.initServerOfflineCheck();
        this.registerHandlers().then(() => {
            this._listener = this._srv.listen(8068, () => {
                logger.ready(`API is listening on port: ${this._listener.address().port}`);

                //this._apiManager.twitchHandler.startEventSubListener();
            });
        });
    }

    public get manager() {
        return this._apiManager;
    }
    public get srv() {
        return this._srv;
    }

    async registerHandlers() {
        this._srv.get("/", (req, res) => {
            res.end(JSON.stringify({
                status: "success",
                message: `Bahamut API v${process.env.npm_package_version} ready!`,
                result: null,
            }));
        });

        // Register all api handlers
        const handlerFiles = await recursive(`${__dirname}/apiHandlers/`);
        for (const file of handlerFiles) {
            const mod = (await import(file)).default;
            mod(this);
        }
        //await this._apiManager.twitchHandler.registerTwitchEventSubListener(this._srv);

        this._srv.get("*", (req, res) => {
            res.status(404);
            res.end(JSON.stringify({
                status: "error",
                message: "Ressource not found",
                result: null,
            }));
        });
    }

    initServerOfflineCheck = () => {
        this._serverOfflineCheckerIntervalId = setInterval(() => {
            this._apiManager.registeredShardingServers.forEach((val, key) => {
                if ((Date.now() - val.lastMessageTime) > 20000) {
                    logger.error(`Server ${val.ip}:${val.port} has been offline for ${Math.floor((Date.now() - val.lastMessageTime) / 1000)} seconds, removing from active servers...`);
                    this._apiManager.registeredShardingServers.delete(key);
                    this._apiManager.managedUsers.delete(key);
                }
            });
        }, 10000);
    };
}