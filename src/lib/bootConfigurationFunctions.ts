import { GlobalBootConfig } from "../../typings.js";
import APIHandler from "../modules/APIHandler.js";
import { readFileSync } from 'fs';
import { resolve } from "path";

const getServerBootConfiguration = async (apiHandler: APIHandler, serverRegisterToken: string) => {
    const serverConfig = await apiHandler.manager.dbHandler.config.getDBServerConfig(serverRegisterToken),
        config_types = JSON.parse(
            readFileSync(resolve("config/config_types.json"), "utf-8")
        ),
        defaultBotSettings = JSON.parse(
            readFileSync(resolve("config/defaultBotSettings.json"), "utf-8")
        );

    const config: GlobalBootConfig = { ...apiHandler.manager.globalConfig };

    serverConfig.testMode = true;

    if (serverConfig.testMode) config.token = apiHandler.manager.globalConfig.test_token;
    else config.token = apiHandler.manager.globalConfig.prod_token;

    delete config.test_token;
    delete config.prod_token;

    // Overwrite global config with per server settings
    for (const [key, val] of Object.entries(serverConfig)) {
        config[key as keyof GlobalBootConfig] = val;
    }

    config["config_types"] = config_types;
    config["defaultSettings"] = defaultBotSettings;

    return config;
};

export { getServerBootConfiguration };