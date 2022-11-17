const toProperCase = (str: string) => {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const fromObject = (obj: any, suppressAttributes: string[] = [], removeUnderscoreVariables = false) => {
    const ret: any = {};

    for (const k of Object.keys(obj)) {
        let name;
        if (removeUnderscoreVariables && k.startsWith("_")) name = k.slice(1);
        else name = k;

        if (!suppressAttributes.includes(name)) {
            ret[name] = obj[k];
        }
    }

    return ret;
};

const groupBy = (array: any[], key: string, properCaseKey = false) => {

    // Return the end result
    return array.reduce((result, currentValue) => {
        let newKey = currentValue[key];
        if (properCaseKey) newKey = newKey.toProperCase();

        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[newKey] = result[newKey] || []).push(
            currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
    }, {});
};

const flattenArray = (arr: any[]): any[] => {
    return arr.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
    }, []);
};

export { toProperCase, fromObject, groupBy, flattenArray };