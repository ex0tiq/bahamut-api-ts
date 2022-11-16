import { Op, WhereOptions } from "sequelize";
import DBHandler, { DBGuildCommandLog } from "../../DBHandler";
import { DateTime } from "luxon";

export default class CommandLogHandler {
// DB Handler instance
    private _dbHandler: DBHandler;

    constructor(dbHandler: DBHandler) {
        this._dbHandler = dbHandler;
    }

    /**
     * Get guild command log count
     * @param {*} guild
     * @returns
     */
    getDBGuildCommandLogCount = async (guild: string): Promise<number> => {
        return new Promise((resolve) => {
            return DBGuildCommandLog
                .count({
                    where: {
                        guild_id: guild,
                    },
                })
                .then(async (count: number) => {
                    resolve(count);
                }).catch(e => {
                    console.error("Error while fetching command log count:", e);
                    resolve(0);
                });
        });
    };

    /**
     * Get user command log count
     * @param guild
     * @param {*} user
     * @returns
     */
    getDBUserCommandLogCount = async (guild: string, user: string): Promise<number> => {
        return new Promise((resolve) => {
            return DBGuildCommandLog
                .count({
                    where: {
                        guild_id: guild,
                        guild_user: user,
                    },
                })
                .then(async (count: number) => {
                    resolve(count);
                }).catch(e => {
                    console.error("Error while fetching command log count:", e);
                    resolve(0);
                });
        });
    };

    /**
     * Get full command log count
     * @returns
     */
    getDBFullCommandLogCount = async (): Promise<number> => {
        return new Promise((resolve) => {
            return DBGuildCommandLog
                .count()
                .then(async (count: number) => {
                    resolve(count);
                }).catch(e => {
                    console.error("Error while fetching command log count:", e);
                    resolve(0);
                });
        });
    };

    getGuildCommandLog = async (guild: string, limit = 25, startDate = null, endDate = null) => {
        return new Promise((resolve) => {
            const where: WhereOptions = {
                guild_id: guild,
            };

            if (startDate && endDate) {
                where["createdAt"] = {
                    [Op.between]: [DateTime.fromMillis(startDate).toFormat("yyyy-MM-dd HH:mm:ss"), DateTime.fromMillis(endDate).toFormat("yyyy-MM-dd HH:mm:ss")],
                };
            } else if (startDate && !endDate) {
                where["createdAt"] = {
                    [Op.lt]: DateTime.fromMillis(startDate).toFormat("yyyy-MM-dd HH:mm:ss"),
                };
            } else if (!startDate && endDate) {
                where["createdAt"] = {
                    [Op.gt]: DateTime.fromMillis(endDate).toFormat("yyyy-MM-dd HH:mm:ss"),
                };
            }

            return DBGuildCommandLog
                .findAll({
                    where: where,
                    order: ["createdAt", "DESC"],
                    limit: limit,
                })
                .then(async (logs) => {
                    resolve(logs);
                }).catch(e => {
                    console.error("Error while fetching command log count:", e);
                    resolve(0);
                });
        });
    };
}