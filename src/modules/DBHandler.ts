import logger from "./Logger";
import { BahamutAPIHandler } from "../index";
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    QueryTypes,
    Sequelize,
} from "sequelize";
import GuildSettingsHandler from "./apiHandlers/databaseHandler/guildSettingsHandler";
import GuildUserStatHandler from "./apiHandlers/databaseHandler/guildUserStatHandler";
import CommandLogHandler from "./apiHandlers/databaseHandler/commandLogHandler";
import ConfigHandler from "./apiHandlers/databaseHandler/configHandler";

export default class DBHandler {
    private _apiManager: BahamutAPIHandler;

    private _dbCon: Sequelize;

    private _commandLog: CommandLogHandler;
    private _config: ConfigHandler;
    private _guildSettings: GuildSettingsHandler;
    private _userStat: GuildUserStatHandler;


    constructor(apiHandler: BahamutAPIHandler) {
        this._apiManager = apiHandler;

        // Set db connector
        this._dbCon = new Sequelize(apiHandler.config.db.database, apiHandler.config.db.user, apiHandler.config.db.pass, {
            host: apiHandler.config.db.host,
            dialect: "mariadb",
            logging: false,
        });

        this.defineModels();

        this._commandLog = new CommandLogHandler(this);
        this._config = new ConfigHandler(this);
        this._guildSettings = new GuildSettingsHandler(this);
        this._userStat = new GuildUserStatHandler(this);
    }

    public get manager() {
        return this._apiManager;
    }

    /**
     * Init DB connection
     */
    dbInit = async () => {
        // Shut down if db connection can't be opened
        if (!(await this.dbOpen())) process.exit(1);
        else logger.ready(`Connected to database: ${await this.getDBVersion()}`);

        // Sync db
        await this._dbCon.sync({ force: false, alter: true });
    };

    /**
     * Open DB connection
     */
    dbOpen = async () => {
        try {
            await this._dbCon.authenticate();
            return true;
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return false;
        }
    };

    getDBVersion = async () => {
        const results = await this._dbCon.query("SELECT @@version as version;", {
            type: QueryTypes.SELECT,
        });
        // @ts-ignore
        return results[0].version;
    };

    defineModels = () => {
        DBGlobalConfig.init({
            setting: {
                type: DataTypes.STRING(30),
                allowNull: false,
                primaryKey: true,
            },
            val: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
                defaultValue: null,
            },
            val_type: {
                type: DataTypes.STRING(30),
                allowNull: true,
                defaultValue: null,
            },
        }, {
            sequelize: this._dbCon,
            modelName: "global_configs",
            freezeTableName: true,
        });
        DBServerConfig.init({
            server: {
                type: DataTypes.STRING(30),
                allowNull: false,
                primaryKey: true,
            },
            setting: {
                type: DataTypes.STRING(30),
                allowNull: false,
                primaryKey: true,
            },
            val: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
                defaultValue: null,
            },
            val_type: {
                type: DataTypes.STRING(30),
                allowNull: true,
                defaultValue: null,
            },
        }, {
            sequelize: this._dbCon,
            modelName: "server_configs",
            freezeTableName: true,
        });
    };
}


// Sequelize DB Types
export class DBGuildStats extends Model<InferAttributes<DBGuildStats>, InferCreationAttributes<DBGuildStats>> {
    declare guild_id: string;
    declare stat: string;
    declare val: number;
    declare updatedAt: CreationOptional<Date>;
}
export class DBGuildSettings extends Model<InferAttributes<DBGuildSettings>, InferCreationAttributes<DBGuildSettings>> {
    declare guild_id: string;
    declare setting: string;
    declare val: string;
    declare val_type: string;
}
export class DBGuildCharacters extends Model<InferAttributes<DBGuildCharacters>, InferCreationAttributes<DBGuildCharacters>> {
    declare guild_id: string;
    declare guild_user: string;
    declare lodestone_char: string;
}
export class DBGuildUserLevels extends Model<InferAttributes<DBGuildUserLevels>, InferCreationAttributes<DBGuildUserLevels>> {
    declare guild_id: string;
    declare guild_user: string;
    declare user_xp: number;
    declare user_level: number;
    declare updatedAt: CreationOptional<Date>;
}
export class DBGuildUserStats extends Model<InferAttributes<DBGuildUserStats>, InferCreationAttributes<DBGuildUserStats>> {
    declare guild_id: string;
    declare guild_user: string;
    declare stat: string;
    declare val: number;
    declare updatedAt: CreationOptional<Date>;
}
export class DBGuildPlaylists extends Model<InferAttributes<DBGuildPlaylists>, InferCreationAttributes<DBGuildPlaylists>> {
    declare id: string;
    declare guild_id: string;
    declare name: string;
}
export class DBGuildSongs extends Model<InferAttributes<DBGuildSongs>, InferCreationAttributes<DBGuildSongs>> {
    declare id: string;
    declare playlist_id: string;
    declare name: string;
    declare link: string;
    declare runtime: number;
}
export class DBGuildCommandLog extends Model<InferAttributes<DBGuildCommandLog>, InferCreationAttributes<DBGuildCommandLog>> {
    declare entry_id?: string;
    declare guild_id: string;
    declare guild_user: string;
    declare guild_username: string;
    declare guild_channel: string;
    declare command: string;
    declare args: string;
    declare createdAt: CreationOptional<Date>;
}
export class DBGlobalConfig extends Model<InferAttributes<DBGlobalConfig>, InferCreationAttributes<DBGlobalConfig>> {
    declare setting: string;
    declare val: string;
    declare val_type: string;
}
export class DBServerConfig extends Model<InferAttributes<DBServerConfig>, InferCreationAttributes<DBServerConfig>> {
    declare server: string;
    declare setting: string;
    declare val: string;
    declare val_type: string;
}