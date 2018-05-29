// functionality for pretty printing text tables in the terminal

var leftWall: string = "| ";
var wall: string = " | ";
var rightWall: string = " |";

// this variable holds the response from MySQL
var table: any;

// this holds relevant metadata for each column so we can appropriately pad each entry in each column
var tableMetadata: any;

// this temporarily holds the user-facing titles for each column
var tableTitles: string[];

var horizontalSeparator: string;

// called by user-facing programs; sends table coming from MySQL to tableMaker and kicks off necessary processing
export var makeTable = function(tableResponse: object[]): void {
    var header: string;
    var separator: string;
    table = tableResponse;

    // Perform the operations so that we can print out the table
    getObjectKeys();
    convertTableKeys();
    priceToFixed2();
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
}

// called by the user-facing program; this is how the user-facing program sends tableMaker the user-facing title for each column
export var sendTitles = function(titles: string[]): void {
    tableTitles = titles;
}

// gets the keys from the first object in the MySQL response array (these correspond to the MySQL table's column titles)
var getObjectKeys = function(): void {
    tableMetadata = Object.keys(table[0]);
}

class Col {
    // class definition
    name: string;

    // constructor
    constructor(name: string) {
        this.name = name;
    }
}

// converts tableKeys to an array of objects
var convertTableKeys = function(): void {
    var tableKeysObj: object[] = [];
    tableMetadata.forEach(element => {
        tableKeysObj.push(new Col(element));
    });
    tableMetadata = tableKeysObj;
}

var updateMetadataWithTitles = function(): void {
    if (tableMetadata.length === tableTitles.length) {
        for (var i: number = 0; i < tableMetadata.length; i++) {
            tableMetadata[i].title = tableTitles[i];
        }
    }
    else {
        console.log("error:  ensure that you've provided the same number of user-facing titles as the number of columns coming from MySQL");
        console.log(`tableMetadata.length is ${tableMetadata.length}, but tableTitles.length is ${tableTitles.length}`);
    }
}

var priceToFixed2 = function(): void {
    table.forEach(element => {
        element.price = element.price.toFixed(2);
    })
}

// gets the length of the longest item in a column and returns the length
var getLengthOfLongestItem = function(response: object[], col: number | string, minLength?: number): number {
    var longest: number = (minLength || 0);
    for (var i: number = 0; i < response.length; i++) {
        if (response[i][col].toString().length > longest) {
            longest = response[i][col].toString().length;
        }
    }
    return longest;
};

// adds the value of the length of the longest item in each column as a new key in each object in tableMetadata
var metadataLongestLength = function(): void {
    tableMetadata.forEach (element => {
        element.longestLength = getLengthOfLongestItem(table, element.name, element.title.length);
    })
}

// generates the appropriate amount padding based on the differences in length of the longest item in a column
// and the length of the current item being considered
var generatePadding = function(lenOfLongest: number, lenOfCurrent: number): string {
    var space: string = "";
    var difference = lenOfLongest - lenOfCurrent;
    for (var i: number = 0; i < difference; i++) {
        space += " ";
    }
    return space;
};

// pads the title (which, by this point, already lives in the tableMetadata array of objects)
var padTitle = function(): void {
    tableMetadata.forEach(element => {
        element.title += generatePadding(element.longestLength, element.title.length);
    });
}

var padEachEntry = function(): void {
    tableMetadata.forEach(element => {
        table.forEach(entry => {
            entry[element.name] += generatePadding(element.longestLength, entry[element.name].toString().length);
        });
    });
}

// generates horizontal line of correct length
var generateHorizontalSeparator = function(howManyChar: number): string {
    var separator: string = "";
    for (var i:number = 0; i < howManyChar; i++) {
        separator += "―";
    }
    return separator;
};

var generateHeader = function(): string {
    var header: string = leftWall;
    for (var i:number = 0; i < tableMetadata.length; i++) {
        if (i === tableMetadata.length - 1) {
            header += tableMetadata[i].title;
        }
        else {
            header += tableMetadata[i].title + wall;
        }
    }
    header += rightWall;
    return header;
}

var printTableBody = function(): void {
    table.forEach(element => {
        var row: string = leftWall;
        for (var i:number = 0; i < tableMetadata.length; i++) {
            if (i === tableMetadata.length - 1) {
                row += element[tableMetadata[i].name];
            }
            else {
                row += element[tableMetadata[i].name] + wall;
            }
        }
        row += rightWall;
        console.log(row);
    })
}