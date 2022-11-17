import APIHandler from "../../APIHandler";
import { parseBool } from "../../../lib/parseFunctions";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/guilds", async (req, res) => {
        if (!req.query || !req.query.guild || req.query.guild === "" || !req.query.user || req.query.user === "") {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        let withAchievements = false, settings = null;
        if (req.query.achievements && (parseBool(<string>req.query.achievements) === true || req.query.achievements === "1")) {
            withAchievements = true;
        }

        settings = await apiHandler.manager.broadcastHandler.broadcastToGuild((_client: BahamutClient, obj: any) => {
            // eslint-disable-next-line no-undef
            return _client.bahamut.dbHandler.guildSettings.getGuildDetails(obj.guildId, obj.userId, obj.withAchievements, obj.language);
        }, <string>req.query.guild, false, { guildId: req.query.guild, userId: req.query.user, withAchievements: withAchievements, language: req.query.language });

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: Array.isArray(settings) ? (Array.isArray(settings[0]) ? settings[0][0] : null) : settings,
        }));
    });
    apiHandler.srv.post("/guilds", async (req, res) => {
        if (!req.query || !req.query.guild || req.query.guild === "") {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        if (req.body.options && req.query.action && req.query.action === "update") {
            let update = await apiHandler.manager.broadcastHandler.broadcastToGuild(async (_client: BahamutClient, obj: any) => {
                // eslint-disable-next-line no-undef
                return _client.bahamut.dbHandler.guildSettings.setGuildOptions(obj.guildId, obj.options);
            }, <string>req.query.guild, false, { guildId: req.query.guild, options: JSON.stringify(req.body.options) });
            // let update = await this.apiManager.setGuildOptions(req.query.guild, JSON.stringify(req.body.options));

            if (Array.isArray(update) && update.length === 1) update = update[0][0];
            if (typeof update === "boolean" && update) {
                res.end(JSON.stringify({
                    status: "success",
                    message: "",
                    result: update,
                }));
            } else {
                res.status(400);
                res.end(JSON.stringify({
                    status: "error",
                    message: "Bad request",
                    result: update,
                }));
            }
        } else {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }
    });
};