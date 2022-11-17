import APIHandler from "../../APIHandler";
import BahamutClient from "bahamutbot/src/modules/BahamutClient";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/userservers", async (req, res) => {
        if (!req.query || !req.query.user || req.query.user === "") {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        const servers = await getUserServers(<string>req.query.user);

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: servers,
        }));
    });

    const getUserServers = async (user: string) => {
        const data = (await apiHandler.manager.broadcastHandler.broadcastToAll((_client: BahamutClient, obj: any) => {
            // eslint-disable-next-line no-undef
            return _client.bahamut.dbHandler.guildSettings.getUserGuilds(obj.userId);
        }, false, { userId: user }));

        const tempData = [];
        for (const shard of data) {
            for (const srv of shard) {
                tempData.push(srv);
            }
        }

        return tempData;
    };
};