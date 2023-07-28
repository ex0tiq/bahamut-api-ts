import APIHandler from "../../APIHandler.js";

export default async (apiHandler: APIHandler) => {

    // Endpoint to search twitch channels
    apiHandler.srv.get("/twitch/getuser", async (req, res) => {
        if (!req.query || !req.query.searchUser) {
            res.status(400);
            res.end(JSON.stringify({
                status: "error",
                message: "Bad request",
                result: null,
            }));
            return;
        }

        const channels = await apiHandler.manager.twitchHandler.searchUsers(<string>req.query.searchUser);

        res.end(JSON.stringify({
            status: "success",
            message: "",
            result: channels,
        }));
    });
};