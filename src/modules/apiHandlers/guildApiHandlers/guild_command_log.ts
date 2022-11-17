import APIHandler from "../../APIHandler";
import { isNumeric } from "../../../lib/validateFunctions";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/guild_command_logs", async (req, res) => {
        if (!req.query.guild || (req.query.limit && !isNumeric(<string>req.query.limit))) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        let limit = 25;
        if (req.query.limit) limit = (parseInt(<string>req.query.limit) > 100 ? 100 : parseInt(<string>req.query.limit));

        const logs = await apiHandler.manager.dbHandler.commandLog.getDBGuildCommandLog(<string>req.query.guild, limit || 25, parseInt(<string>req.query.startDate) || null, parseInt(<string>req.query.endDate) || null);

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: logs,
        }));
    });
};