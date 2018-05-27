// functionality for pretty printing text tables in the terminal:
// fundamentally, what a text table is... is making it so each item in a column has the same length

// so we need to get the length of the longest item in a column, then pad every item with a shorter length the appropriate amount
export var getLengthOfLongestItem = function (response: object[], col: number | string): number {
    var longest = 0;
    for (var i: number = 0; i < response.length; i++) {
        if (response[i][col].toString().length > longest) {
            longest = response[i][col].toString().length;
        }
    }
    return longest;
};

// then we need to generate the right number of spaces for everything shorter than the longest item
// this is the difference between the length of the longest string and the current string we're considering
export var generatePadding = function (lenOfLongest: number, lenOfCurrent: number): string {
    var space: string = "";
    var difference = lenOfLongest - lenOfCurrent;
    for (var i: number = 0; i < difference; i++) {
        space += " ";
    }
    return space;
};

// generates horizontal line of correct length
export var generateHorizontalSeparator = function (howManyChar: number): string {
    var separator: string = "";
    for (var i:number = 0; i < howManyChar; i++) {
        separator += "―";
    }
    return separator;
};

