import { isInt, isJson } from "../../lib/validateFunctions";
import { parseBool } from "../../lib/parseFunctions";
import DBHandler, { DBGuildSettings } from "../DBHandler";

export default class GuildSettingsHandler {
    // DB Handler instance
    private _dbHandler: DBHandler;

    constructor(dbHandler: DBHandler) {
        this._dbHandler = dbHandler;
    }

    getDBAllGuildSettings = async () => {
        try {
            const settings = await DBGuildSettings.findAll({
                raw: true,
            });

            const obj: {
                    [guild: string]: any
                } = {};

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

                obj[g.guild_id][g.setting] = val;
            }

            return new Map(Object.entries(obj));
        } catch (error) {
            console.error("An error occured while querying guild settings:", error);
            return this._dbHandler.manager.config.defaultSettings;
        }
    };

    setDBGuildSetting = async (guild: string, setting: string, value: any, value_type?: string): Promise<boolean> => {
        const types = this._dbHandler.manager.config.config_types, type = types[setting] || "string";

        return new Promise((resolve) => {
            return DBGuildSettings
                .findOne({
                    where: {
                        guild_id: guild,
                        setting: setting,
                    },
                })
                .then(async (obj: DBGuildSettings | null) => {
                    if (obj) {
                        // update
                        await obj.update({
                            val: value,
                            val_type: value_type || type,
                        });
                    } else {
                        // insert
                        await DBGuildSettings.create({
                            guild_id: guild,
                            setting: setting,
                            val: value,
                            val_type: value_type || type,
                        });
                    }

                    resolve(true);
                }).catch(e => {
                    console.error("Error while saving guild setting:", e);
                    resolve(false);
                });
        });
    };
}