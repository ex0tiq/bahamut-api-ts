import { isUserBotAdmin } from "../../../lib/isFunctions.js";
import APIHandler from "../../APIHandler.js";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/user", async (req, res) => {
        if (!req.query || !req.query.user || req.query.user === "" || !req.query.action || !["admincheck"].includes((<string>req.query.action).toLowerCase())) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        let result = null;

        if ((<string>req.query.action).toLowerCase() === "admincheck") {
            result = await isUserBotAdmin(apiHandler, <string>req.query.user);
        }

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: result,
        }));
    });
};