import { isUserBotAdmin } from "../../../lib/isFunctions.js";
import APIHandler from "../../APIHandler.js";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/admin/guildOverview", async (req, res) => {
        if (!req.query.action || !req.query.user || !["list"].includes((<string>req.query.action).toLowerCase())) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        if (!await (isUserBotAdmin(apiHandler, (<string>req.query.user)))) {
            res.status(403);
            res.end(JSON.stringify({
                status: "error",
                message: "Access denied",
                result: null,
            }));
            return;
        }

        let result = null;
        const startFrom = <string>req.query.startFrom || null,
            limit = parseInt(<string>req.query.limit) || 25;

        if ((<string>req.query.action).toLowerCase() === "list") {
            result = apiHandler.manager.broadcastHandler.getManagedGuilds(startFrom, limit);
        }

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: result,
        }));
    });
};