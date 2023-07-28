/*
Logger class for easy and aesthetically pleasing console logging
*/
import chalk from "chalk";
import { DateTime } from "luxon";

export class Logger {
    log = (content: string, type = "log") => {
        const timestamp = `[${DateTime.now().toFormat("yyyy-LL-dd HH:mm:ss")}]:`;
        switch (type) {
            case "log": {
                return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
            }
            case "warn": {
                return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
            }
            case "error": {
                return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
            }
            case "debug": {
                return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
            }
            case "cmd": {
                return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
            }
            default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
        }
    };

    error = (content: string) => this.log(content, "error");
    warn = (content: string) => this.log(content, "warn");
    debug = (content: string) => this.log(content, "debug");
    cmd = (content: string) => this.log(content, "cmd");
    ready = (content: string) => this.log(content, "ready");
}

export default new Logger;

