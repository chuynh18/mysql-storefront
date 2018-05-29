"use strict";
// functionality for pretty printing text tables in the terminal
Object.defineProperty(exports, "__esModule", { value: true });
var leftWall = "| ";
var wall = " | ";
var rightWall = " |";
// this variable holds the response from MySQL
var table;
// this holds relevant metadata for each column so we can appropriately pad each entry in each column
var tableMetadata;
// this temporarily holds the user-facing titles for each column
var tableTitles;
var horizontalSeparator;
// called by user-facing programs; sends table coming from MySQL to tableMaker and kicks off necessary processing
exports.makeTable = function (tableResponse) {
    var header;
    var separator;
    table = tableResponse;
    // Perform the operations so that we can print out the table
    getObjectKeys();
    convertTableKeys();
    updateMetadataWithTitles();
    metadataLongestLength();
    padTitle();
    padEachEntry();
    // build the table header
    header = generateHeader();
    // build the horizontal separator
    separator = generateHorizontalSeparator(header.length);
    // print out the table
    console.log(separator);
    console.log(header);
    console.log(separator);
    printTableBody();
    console.log(separator);
};
// called by the user-facing program; this is how the user-facing program sends tableMaker the user-facing title for each column
exports.sendTitles = function (titles) {
    tableTitles = titles;
};
// gets the keys from the first object in the MySQL response array (these correspond to the MySQL table's column titles)
var getObjectKeys = function () {
    tableMetadata = Object.keys(table[0]);
};
var Col = /** @class */ (function () {
    // constructor
    function Col(name) {
        this.name = name;
    }
    return Col;
}());
// converts tableKeys to an array of objects
var convertTableKeys = function () {
    var tableKeysObj = [];
    tableMetadata.forEach(function (element) {
        tableKeysObj.push(new Col(element));
    });
    tableMetadata = tableKeysObj;
};
var updateMetadataWithTitles = function () {
    if (tableMetadata.length === tableTitles.length) {
        for (var i = 0; i < tableMetadata.length; i++) {
            tableMetadata[i].title = tableTitles[i];
        }
    }
    else {
        console.log("error:  ensure that you've provided the same number of user-facing titles as the number of columns coming from MySQL");
        console.log("tableMetadata.length is " + tableMetadata.length + ", but tableTitles.length is " + tableTitles.length);
    }
};
// gets the length of the longest item in a column and returns the length
var getLengthOfLongestItem = function (response, col, minLength) {
    var longest = (minLength || 0);
    for (var i = 0; i < response.length; i++) {
        if (response[i][col].toString().length > longest) {
            longest = response[i][col].toString().length;
        }
    }
    return longest;
};
// adds the value of the length of the longest item in each column as a new key in each object in tableMetadata
var metadataLongestLength = function () {
    tableMetadata.forEach(function (element) {
        element.longestLength = getLengthOfLongestItem(table, element.name, element.title.length);
    });
};
// generates the appropriate amount padding based on the differences in length of the longest item in a column
// and the length of the current item being considered
var generatePadding = function (lenOfLongest, lenOfCurrent) {
    var space = "";
    var difference = lenOfLongest - lenOfCurrent;
    for (var i = 0; i < difference; i++) {
        space += " ";
    }
    return space;
};
// pads the title (which, by this point, already lives in the tableMetadata array of objects)
var padTitle = function () {
    tableMetadata.forEach(function (element) {
        element.title += generatePadding(element.longestLength, element.title.length);
    });
};
var padEachEntry = function () {
    tableMetadata.forEach(function (element) {
        table.forEach(function (entry) {
            entry[element.name] += generatePadding(element.longestLength, entry[element.name].toString().length);
        });
    });
};
// generates horizontal line of correct length
var generateHorizontalSeparator = function (howManyChar) {
    var separator = "";
    for (var i = 0; i < howManyChar; i++) {
        separator += "―";
    }
    return separator;
};
var generateHeader = function () {
    var header = leftWall;
    for (var i = 0; i < tableMetadata.length; i++) {
        if (i === tableMetadata.length - 1) {
            header += tableMetadata[i].title;
        }
        else {
            header += tableMetadata[i].title + wall;
        }
    }
    header += rightWall;
    return header;
};
var printTableBody = function () {
    table.forEach(function (element) {
        var row = leftWall;
        for (var i = 0; i < tableMetadata.length; i++) {
            if (i === tableMetadata.length - 1) {
                row += element[tableMetadata[i].name];
            }
            else {
                row += element[tableMetadata[i].name] + wall;
            }
        }
        // tableMetadata.forEach(entry => {
        //     row += element[entry.name] + wall;
        // })
        // row = row.slice(0,row.length - 3);
        row += rightWall;
        console.log(row);
    });
};
