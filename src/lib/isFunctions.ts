import APIHandler from "../modules/APIHandler";

const isUserBotAdmin = async (apiHandler: APIHandler, user: string, globalConfig?: any) => {
    if (!globalConfig) globalConfig = require("../../config/global_config.json") || {};
    return (globalConfig["owner_id"] === user || globalConfig["admins"]!.includes(user));
};

export { isUserBotAdmin };