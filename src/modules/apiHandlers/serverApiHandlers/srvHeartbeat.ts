import logger from "../../Logger.js";
import { getServerBootConfiguration } from "../../../lib/bootConfigurationFunctions.js";
import { isUUID } from "../../../lib/validateFunctions.js";
import ShardingServer from "../../ShardingServer.js";
import APIHandler from "../../APIHandler.js";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.post("/srvHeartbeat", async (req, res) => {
        // Check register pre-requisites
        if (!req.query || !req.query.registerToken) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }
        if (!apiHandler.manager.config.register_tokens.includes(req.query.registerToken as string)) {
            res.status(403);
            res.end(JSON.stringify({
                status: "error",
                message: "Access denied",
                result: null,
            }));
            return;
        }

        // Check if all server information provided
        if (!req.body || !req.body.port || (!req.body.communication_token || !isUUID(req.body.communication_token)) || !req.body.startupTime) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

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

        if (!apiHandler.manager.registeredShardingServers.has(<string>req.query.registerToken) || apiHandler.manager.registeredShardingServers.get(<string>req.query.registerToken)?.communication_token !== req.body.communication_token) {
            logger.ready(`New server ${ip}:${req.body.port} online and registered (Latency: ${(Date.now() - req.body.currentTime)}ms).`);
        }

        apiHandler.manager.registeredShardingServers.set(<string>req.query.registerToken, new ShardingServer(req.body, <string>ip!));

        if (req.body.requestBootConf) {
            res.end(JSON.stringify({
                status: "success",
                message: "bootconf",
                result: (await getServerBootConfiguration(apiHandler, <string>req.query.registerToken)),
            }));
        } else {
            res.end(JSON.stringify({
                status: "success",
                message: "",
                result: null,
            }));
        }


    });
};