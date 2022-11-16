import logger from "../../Logger";
import { BahamutAPIHandler } from "../../../index";
import { getServerBootConfiguration } from "../../../lib/bootConfigurationFunctions";
const { isUUID } = require("../../../lib/validateFunctions");
const ShardingServer = require("../../classes/ShardingServer");

export default (apiHandler: BahamutAPIHandler) => {
    apiHandler.apiHandler.srv.post("/srvHeartbeat", async (req, res) => {
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
        if (!apiHandler.config.register_tokens.includes(req.query.registerToken)) {
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

        if (!apiHandler.registeredShardingServers.has(req.query.registerToken) || apiHandler.registeredShardingServers.get(req.query.registerToken).communication_token !== req.body.communication_token) {
            logger.ready(`New server ${ip}:${req.body.port} online and registered (Latency: ${(Date.now() - req.body.currentTime)}ms).`);
        }

        apiHandler.registeredShardingServers.set(req.query.registerToken, new ShardingServer(req.body, ip));

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