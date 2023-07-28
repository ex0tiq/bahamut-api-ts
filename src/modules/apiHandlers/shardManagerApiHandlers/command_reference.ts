import APIHandler from "../../APIHandler.js";

export default (apiHandler: APIHandler) => {
    apiHandler.srv.get("/command_reference", async (req, res) => {
        // const commands = await this.getCommandReference();

        res.end(JSON.stringify({
            status: "success",
            message: "Not yet implemented",
            result: null,
        }));
    });
/*
    this.getCommandReference = async () => {
        let data = (await apiHandler.broadcastToShard(() => {
            const slugify = await import("slugify");

            const categories = Array.from(this.cmdHandler.categories.keys()),
                help = {};
            let cmdCount = 0;

            try {
                categories.sort((a, b) => a.localeCompare(b)).forEach(cat => {
                    const temp = {},
                        cmds = this.cmdHandler.commandHandler.getCommandsByCategory(cat, true);

                    cmds.forEach(c => {
                        if (!c.hidden && !c.testOnly && !c.ownerOnly) {
                            temp[c.names[0]] = {
                                "description": c.description,
                                "aliases": c.names.slice(1),
                                "usage": `${c.names[0]} ${c.syntax}`,
                            };
                            cmdCount++;
                        }
                    });

                    if (Object.keys(temp).length > 0) {
                        help[slugify(cat.replace(/(:.*?:)/g, "").trim(), {
                            lower: true,
                            strict: true,
                            locale: "en",
                        })] = {
                            "name": `${this.cmdHandler.categories.get(cat)} ${cat}`,
                            "clean_name": cat.replace(/(:.*?:)/g, "").trim(),
                            "commands": temp,
                        };
                    }
                });
            } catch (ex) {
                console.error(ex);
            }

            if (cmdCount < 100) {
                return false;
            }

            return help;
        }, 0));

        data = data.filter(e => e != null);
        if (Array.isArray(data) && data.length > 0) data = data[0];

        return data;
    };

 */
};