import { isInt, isJson } from "../../lib/validateFunctions";
import { parseBool } from "../../lib/parseFunctions";
import DBHandler, { DBGuildSettings } from "../DBHandler";
import { WhereOptions } from "sequelize";
import { GuildSettings } from "bahamutbot";
import { GlobalGuildSettings } from "../../../typings";

export default class GuildSettingsHandler {
    // DB Handler instance
    private _dbHandler: DBHandler;

    constructor(dbHandler: DBHandler) {
        this._dbHandler = dbHandler;
    }

    getDBAllGuildSettings = async (setting?: string) => {
        try {
            const where: WhereOptions = {};
            if (setting) where["setting"] = setting;

            const settings = await DBGuildSettings.findAll({
                where: where,
                raw: true,
                // eslint-disable-next-line no-empty-function
            }).catch(() => {});

            const obj: {
                    [guild: string]: any
                } = {};

            if (!settings) return obj;

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

    getDBGuildSettings = async (guild: string): Promise<GuildSettings | GlobalGuildSettings | null> => {
        try {
            const settings = await DBGuildSettings.findAll({
                where: {
                    guild_id: guild,
                },
                raw: true,
                // eslint-disable-next-line no-empty-function
            }).catch(() => {});

            if (!settings) return null;

            const mappedSettings = settings.map((e: DBGuildSettings) => {
                let val: any;

                switch (e.val_type) {
                    case "string":
                        return {
                            [e.setting]: e.val,
                        };
                    case "json":
                        if (isJson(e.val)) {
                            return {
                                [e.setting]: JSON.parse(e.val),
                            };
                        } else {
                            return {
                                [e.setting]: e.val,
                            };
                        }
                    case "bool":
                        if ((val = parseBool(e.val)) !== null) {
                            return {
                                [e.setting]: val,
                            };
                        } else {
                            return {
                                [e.setting]: e.val,
                            };
                        }
                    case "int":
                        if (isInt(e.val) && (val = parseInt(e.val, 10))) {
                            return {
                                [e.setting]: val,
                            };
                        } else {
                            return {
                                [e.setting]: e.val,
                            };
                        }
                    default:
                        return {
                            [e.setting]: e.val,
                        };
                }
            });

            return {
                ...this._dbHandler.manager.config.defaultSettings,
                ...(Object.assign({}, ...mappedSettings) as GuildSettings),
            };
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