const toProperCase = (str: string) => {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const fromObject = (obj: any, suppressAttributes: string[] = []) => {
    const ret: any = {};

    for (const k of Object.keys(obj)) {
        if (!suppressAttributes.includes(k)) ret[k] = obj[k];
    }

    return ret;
};

export { toProperCase, fromObject };