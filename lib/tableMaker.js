"use strict";
// functionality for pretty printing text tables in the terminal:
// fundamentally, what a text table is... is making it so each item in a column has the same length
Object.defineProperty(exports, "__esModule", { value: true });
// so we need to get the length of the longest item in a column, then pad every item with a shorter length the appropriate amount
exports.getLengthOfLongestItem = function (response, col) {
    var longest = 0;
    for (var i = 0; i < response.length; i++) {
        if (response[i][col].toString().length > longest) {
            longest = response[i][col].toString().length;
        }
    }
    return longest;
};
// then we need to generate the right number of spaces for everything shorter than the longest item
// this is the difference between the length of the longest string and the current string we're considering
exports.generatePadding = function (lenOfLongest, lenOfCurrent) {
    var space = "";
    var difference = lenOfLongest - lenOfCurrent;
    for (var i = 0; i < difference; i++) {
        space += " ";
    }
    return space;
};
// generates horizontal line of correct length
exports.generateHorizontalSeparator = function (howManyChar) {
    var separator = "";
    for (var i = 0; i < howManyChar; i++) {
        separator += "―";
    }
    return separator;
};
