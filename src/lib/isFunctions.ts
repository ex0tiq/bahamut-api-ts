import APIHandler from "../modules/APIHandler";

const isUserBotAdmin = async (apiHandler: APIHandler, user: string, globalConfig?: Map<string, string>) => {
    if (!globalConfig) globalConfig = await apiHandler.manager.dbHandler.config.getDBGlobalConfig();
    return (globalConfig.get("owner_id") === user || globalConfig.get("admins")!.includes(user));
};

export { isUserBotAdmin };