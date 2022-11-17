import { groupBy } from "../../../lib/toolFunctions";
import APIHandler from "../../APIHandler";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/registeredServers", async (req, res) => {
        if (!req.query.action || !["list"].includes((<string>req.query.action).toLowerCase())) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        let result = null;

        if ((<string>req.query.action).toLowerCase() === "list") {
            // eslint-disable-next-line no-unused-vars
            result = Array.from(apiHandler.manager.registeredShardingServers.values()).map(({ communication_token, ...otherAttrs }) => otherAttrs);

            if (req.query.locationSeparated) {
                result = groupBy(result, "serverLocation", true);
            }
        }

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: result,
        }));
    });
};