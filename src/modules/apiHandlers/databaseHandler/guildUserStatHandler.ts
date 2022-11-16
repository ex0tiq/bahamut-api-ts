import { Op, WhereOptions } from "sequelize";
import DBHandler, { DBGuildUserStats } from "../../DBHandler";

export default class GuildUserStatHandler {
    // DB Handler instance
    private _dbHandler: DBHandler;

    constructor(dbHandler: DBHandler) {
        this._dbHandler = dbHandler;
    }

    /**
     * Get current guild users stats
     * @param guild
     * @param user
     * @param stats
     */
    getDBGuildUserStats = async (guild: string, user: string, stats?: string[]): Promise<Map<string, { val: number, updatedAt: Date }> | null> => {
        const where: WhereOptions = {
            guild_id: guild,
        };

        if (user) where["guild_user"] = user;
        if (stats && stats.length) {
            // @ts-ignore
            where[Op.or] = stats.map(e => {
                return {
                    stat: e,
                };
            });
        }

        const res: DBGuildUserStats[] | null = await new Promise((resolve) => {
            return DBGuildUserStats
                .findAll({
                    where: where,
                })
                .then(async (obj: DBGuildUserStats[] | null) => {
                    if (obj) resolve(obj);
                    else resolve(null);
                }).catch(e => {
                    console.error("Error while querying guild user stat:", e);
                    resolve(null);
                });
        });

        if (!res) return null;

        const resMap = new Map<string, { val: number, updatedAt: Date }>;
        for (const s of res) {
            resMap.set(s.stat, {
                val: s.val,
                updatedAt: s.updatedAt,
            });
        }

        return resMap;
    };
}