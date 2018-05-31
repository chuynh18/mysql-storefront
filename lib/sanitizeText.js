"use strict";
// this escapes the various types of quotes
Object.defineProperty(exports, "__esModule", { value: true });
var replacementTable = ["'", '"', "`"];
exports.sanitize = function (input) {
    var sanitized = input;
    for (var i = 0; i < replacementTable.length; i++) {
        sanitized = sanitized.replace(replacementTable[i], "\\" + replacementTable[i]);
    }
    return sanitized;
};
