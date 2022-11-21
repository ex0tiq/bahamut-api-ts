import APIHandler from "../modules/APIHandler";

const isUserBotAdmin = async (apiHandler: APIHandler, user: string) => {
    return (apiHandler.manager.globalConfig["owner_id"] === user || apiHandler.manager.globalConfig["admins"]!.includes(user));
};

export { isUserBotAdmin };