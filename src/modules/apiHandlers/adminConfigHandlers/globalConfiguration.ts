import { isUserBotAdmin } from "../../../lib/isFunctions";
import APIHandler from "../../APIHandler";

export default(apiHandler: APIHandler) => {
    apiHandler.srv.get("/admin/globalConfiguration", async (req, res) => {
        if (!req.query.action || !req.query.user || !["get"].includes((<string>req.query.action).toLowerCase())) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        const globalConfig = require("../../config/global_config.json") || {};
        if (!await (isUserBotAdmin(apiHandler, <string>req.query.user, { ...globalConfig }))) {
            res.status(403);
            res.end(JSON.stringify({
                status: "error",
                message: "Access denied",
                result: null,
            }));
            return;
        }

        let result = null;

        if ((<string>req.query.action).toLowerCase() === "get") {
            // eslint-disable-next-line no-unused-vars
            result = globalConfig;
        }

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: result,
        }));
    });
};