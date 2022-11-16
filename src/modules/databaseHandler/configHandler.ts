import DBHandler, { DBGlobalConfig, DBServerConfig } from "../DBHandler";
import { isInt, isJson } from "../../lib/validateFunctions";
import { parseBool } from "../../lib/parseFunctions";

export default class ConfigHandler {
// DB Handler instance
    private _dbHandler: DBHandler;

    constructor(dbHandler: DBHandler) {
        this._dbHandler = dbHandler;
    }

    getDBGlobalConfig = async (): Promise<Map<string, string>> => {
        try {
            const settings = await DBGlobalConfig.findAll({
                raw: true,
            });

            const mappedSettings: Map<string, any> = new Map<string, any>;

            for (const g of settings) {
                let val;

                switch (g.val_type) {
                    case "string":
                        val = g.val;
                        break;
                    case "json":
                        if (isJson(g.val)) val = JSON.parse(g.val);
                        else val = g.val;
                        break;
                    case "bool":
                        if ((parseBool(g.val)) !== null) val = parseBool(g.val);
                        else val = g.val;
                        break;
                    case "int":
                        if (isInt(g.val) && (parseInt(g.val))) val = parseInt(g.val);
                        else val = g.val;
                        break;
                    default:
                        val = g.val;
                        break;
                }

                mappedSettings.set(g.setting, val);
            }

            return mappedSettings;
        } catch (error) {
            console.error("An error occured while querying global settings:", error);
            return this._dbHandler.manager.config.defaultSettings;
        }
    };

    getDBServerConfig = async (serverId: string) => {
        try {
            const settings = await DBServerConfig.findAll({
                where: {
                    server: serverId,
                },
                raw: true,
            });

            const mappedSettings: Map<string, any> = new Map<string, any>;

            for (const g of settings) {
                let val;

                switch (g.val_type) {
                    case "string":
                        val = g.val;
                        break;
                    case "json":
                        if (isJson(g.val)) val = JSON.parse(g.val);
                        else val = g.val;
                        break;
                    case "bool":
                        if ((parseBool(g.val)) !== null) val = parseBool(g.val);
                        else val = g.val;
                        break;
                    case "int":
                        if (isInt(g.val) && (parseInt(g.val))) val = parseInt(g.val);
                        else val = g.val;
                        break;
                    default:
                        val = g.val;
                        break;
                }

                mappedSettings.set(g.setting, val);
            }

            return mappedSettings;
        } catch (error) {
            console.error("An error occured while querying server settings:", error);
            return this._dbHandler.manager.config.defaultSettings;
        }
    };
}
