import APIHandler from "../modules/APIHandler";

const getServerBootConfiguration = async (apiHandler: APIHandler, serverRegisterToken: string) => {
    const globalConfig = await apiHandler.manager.dbHandler.config.getDBGlobalConfig(),
        serverConfig = await apiHandler.manager.dbHandler.config.getDBServerConfig(serverRegisterToken),
        config_types = require("../../config/config_types.json"),
        defaultBotSettings = require("../../config/defaultBotSettings.json");

    const temp = Object.fromEntries(globalConfig.entries());

    serverConfig.testMode = true;

    if (serverConfig.testMode) temp["token"] = globalConfig.get("test_token");
    else temp["token"] = globalConfig.get("prod_token");

    delete temp["test_token"];
    delete temp["prod_token"];

    // Overwrite global config with per server settings
    for (const [key, val] of Object.entries(serverConfig)) {
        temp[key] = val;
    }

    temp["config_types"] = config_types;
    temp["defaultSettings"] = defaultBotSettings;

    return temp;
};

export { getServerBootConfiguration };