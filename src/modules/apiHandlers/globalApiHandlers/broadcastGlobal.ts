import { isUserBotAdmin } from "../../../lib/isFunctions.js";
import APIHandler from "../../APIHandler.js";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/admin/broadcastGlobal", async (req, res) => {
        if (!req.query.action || !req.query.user || !["list"].includes((<string>req.query.action).toLowerCase())) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        if (!await (isUserBotAdmin(apiHandler, <string>req.query.user))) {
            res.status(403);
            res.end(JSON.stringify({
                status: "error",
                message: "Access denied",
                result: null,
            }));
            return;
        }


        res.end(JSON.stringify({
            status: "success",
            message: "Not implemented.",
            result: null,
        }));
    });
};