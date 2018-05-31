// this escapes the various types of quotes

var replacementTable = ["'", '"', "`", ":", ";", "[", "]", "{", "}"];

export var sanitize = function(input: string): string {
    var sanitized = input;
    for (var i: number = 0; i < replacementTable.length; i++) {
        sanitized = sanitized.replace(replacementTable[i],`\\${replacementTable[i]}`);
    }
    return sanitized;
}