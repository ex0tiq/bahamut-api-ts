import APIHandler from "../modules/APIHandler";

const getServerBootConfiguration = async (apiHandler: APIHandler, serverRegisterToken: string) => {
    const globalConfig = require("../../config/global_config.json") || {},
        serverConfig = await apiHandler.manager.dbHandler.config.getDBServerConfig(serverRegisterToken),
        config_types = require("../../config/config_types.json"),
        defaultBotSettings = require("../../config/defaultBotSettings.json");

    const config = { ...globalConfig };

    serverConfig.testMode = true;

    if (serverConfig.testMode) config.token = globalConfig.test_token;
    else config.token = globalConfig.prod_token;

    delete config.test_token;
    delete config.prod_token;

    // Overwrite global config with per server settings
    for (const [key, val] of Object.entries(serverConfig)) {
        config[key] = val;
    }

    config["config_types"] = config_types;
    config["defaultSettings"] = defaultBotSettings;

    return config;
};

export { getServerBootConfiguration };