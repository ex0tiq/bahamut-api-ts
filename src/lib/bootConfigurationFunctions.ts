import { BahamutAPIHandler } from "../index";

const getServerBootConfiguration = async (apiHandler: BahamutAPIHandler, serverRegisterToken: string) => {
    const globalConfig = await apiHandler.dbHandler.getGlobalConfig(),
        serverConfig = await apiHandler.dbHandler.getServerConfig(serverRegisterToken),
        config_types = require("../../config/config_types.json"),
        defaultBotSettings = require("../../config/defaultBotSettings.json");

    serverConfig.testMode = true;

    if (serverConfig.testMode) globalConfig.token = globalConfig.test_token;
    else globalConfig.token = globalConfig.prod_token;

    delete globalConfig.test_token;
    delete globalConfig.prod_token;

    // Overwrite global config with per server settings
    for (const [key, val] of Object.entries(serverConfig)) {
        globalConfig[key] = val;
    }

    globalConfig["config_types"] = config_types;
    globalConfig["defaultSettings"] = defaultBotSettings;

    return globalConfig;
};

export { getServerBootConfiguration };