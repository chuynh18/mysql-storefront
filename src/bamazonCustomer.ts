// I guess this is how you require in TypeScript (as opposed to... var inquirer = require("inquirer"); ...etc.)
import inquirer = require("inquirer");
import mysql = require("mysql");
import { getLengthOfLongestItem } from "./tableMaker";
import { generatePadding } from "./tableMaker";
import { generateHorizontalSeparator } from "./tableMaker";

// Since I don't expect to instantiate other objects of class ConnectionInfo, doing it this way is functionally pointless.
// I'm only doing it for the learning.
class ConnectionInfo {
    // class definition
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;

    // just your plain old constructor
    constructor(host: string, port: number, user: string, password: string, database: string) {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.database = database;
    }
}

class Choices {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

var choices: any[] = [];

// oh heeyyyooooo it's a root password in plain text on a public GitHub
var connectionInfo = new ConnectionInfo("localhost", 3306, "root", "8U#mDA345vUk5W6vtjVCSMStLUWHmD!u", "bamazon");

// all that work, and THIS is the payoff?!  As I said earlier, all this was for learning.
var connection = mysql.createConnection(connectionInfo);

// it does what it says.  connect to the database
var connectToDB = function(): void {
    connection.connect((err) => {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
    })
}

// disconnects from the database
var disconnectFromDB = function(): void {
    connection.end();
    console.log("disconnected from database.\n");
}

var pushToChoices = function(id: number, name: string): void {
    choices.push(new Choices(id, name));
}

// I'm not happy that I've only managed to partially pull out some of the table functionality.
// A lot of heavy lifting is still done inside the main program, making it hard to understand what's going on.
// I know this isn't great.  But totally separating the table functionality is not an easy problem.
var drawTable = function(): void {
    var query: string = "SELECT item_id, product_name, price, stock_quantity FROM products";
    connection.query(query, function(err, res) {
        if (err) throw err;
        // specifying that these vars are numbers is redundant because I know the function returns a number
        // and I ABSOLUTELY KNOW it returns a number because TypeScript gives me confidence!
        var idLength: number = getLengthOfLongestItem(res, "item_id");
        var productLength: number = getLengthOfLongestItem(res, "product_name");
        var priceLength: number = getLengthOfLongestItem(res, "price");
        var stockLength: number = getLengthOfLongestItem(res, "stock_quantity");
        var separator: string;
        var lenSeparator: number;
        var id: string = "ID" + generatePadding(idLength, "ID".length);
        var product: string = "PRODUCT" + generatePadding(productLength, "PRODUCT".length);
        var price: string = "PRICE" + generatePadding(priceLength, "PRICE".length);
        var stock: string = "QTY" + generatePadding(stockLength, "QTY".length);
        var header: string = "";
        
        // insert padding on the right-hand side for each entry
        for (var i: number = 0; i < res.length; i++) {
            pushToChoices(res[i].item_id, res[i].product_name);
            res[i].item_id += generatePadding(idLength, res[i].item_id.toString().length);
            res[i].product_name += generatePadding(productLength, res[i].product_name.length);
            res[i].price += generatePadding(priceLength, res[i].price.toString().length);
            res[i].stock_quantity += generatePadding(stockLength, res[i].stock_quantity.toString().length);
        }

        // generate the separator based on the length of the first row (all rows are now the same length due to padding insertion)
        lenSeparator = ("| " + res[0].item_id + " | " + res[0].product_name + " | " + res[0].price + " | " + res[0].stock_quantity + " |").length;
        separator = generateHorizontalSeparator(lenSeparator);

        // print out the table header
        console.log(separator);
        header = "| " + id + " | " + product + " | " + price + " | " + stock + " |";
        console.log(header);

        // print out the rest of the table
        console.log(separator);
        for (var i: number = 0; i < res.length; i++) {
            var lineItem: string = "| " + res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity + " |";
            console.log(lineItem);
        }
        console.log(separator);
        setTimeout(mainMenu, 200);
    })
}

var mainMenu = function(): void {
    inquirer
    .prompt([
        {
            type: "list",
            message: "Which item would you like to purchase today?",
            choices: choices,
            name: "purchase"
        }
    ])
    .then((response) => {
        var itemId: number;
        var query: string = "SELECT stock_quantity FROM products WHERE ?";
        for (var i: number = 0; i < choices.length; i++) {
            if (response.purchase === choices[i].name) {
                itemId = choices[i].id;
            }
        }
        connection.query(query, 
            {item_id: itemId},
            function(err, res) {
            if (res[0].stock_quantity === 0) {
                console.log("\nSorry, this item isn't currently in stock.  Please order something else.\n");
                mainMenu();
            }
            else {
                quantityMenu(response.purchase, itemId);
            }
        })
    })
}

var quantityMenu = function(item: string, itemId: number): void {
    function checkForNum(qty: any): boolean | string {
        if (parseInt(qty) === 0) {
            return ("Please purchase more than 0 items.  Besides, what does purchasing 0 items even mean?")
        }
        else if (/^[0-9]/.test(qty)) {
            return true;
        }
        else {return "Please enter a number."}
    }
    inquirer
    .prompt([
        {
            type: "input",
            message: "How many would you like to purchase?",
            name: "quantity",
            validate: checkForNum
        }
    ])
    .then((response) => {
        var query: string = "SELECT stock_quantity FROM products WHERE ?";
        console.log("One moment please.  I'm checking to see if I can purchase " + response.quantity + " of " + item + " for you.");
        connection.query(query, 
            {item_id: itemId},
            function(err, res) {
            if (response.quantity > res[0].stock_quantity) {
                console.log("Sorry, we don't have that many in stock.  Please try ordering fewer.");
                quantityMenu(item, itemId);
            }
            else {
                purchaseConfirmation(item, itemId, response.quantity, res[0].stock_quantity);
            }
        })
    })
};

var purchaseConfirmation = function(item: string, itemId: number, qty: number, inStock: number): void {
    var query: string = "SELECT price FROM products WHERE ?";
    var total: string;
    var price: number;
    connection.query(query, 
        {item_id: itemId},
        function(err, res) {
            price = res[0].price;
            total = (qty * price).toFixed(2);
            console.log(`Your purchase for ${qty} of ${item} will amount to $${total}.`);
            inquirer
        .prompt([
            {
                type: "confirm",
                message: "Would you like to finalize this purchase?",
                name: "confirm",
                default: true
            }
        ])
        .then((answer) => {
            if (answer.confirm) {
                updateDB(itemId, qty, inStock);
            }
            else {
                console.log("Not a problem!  Your purchase has been canceled.");
                continueShopping();
            }
        })
    })
}

var updateDB = function(itemId: number, qty: number, inStock: number):void {
    var newValue: number = inStock - qty;
    var query: string = `UPDATE products SET stock_quantity = ${newValue} WHERE ?`;
    connection.query(query, 
        {item_id: itemId},
        function(err, res) {
            console.log("Your purchase was made successfully!  Thank you for shopping with us.");
            continueShopping();
        })
}

var continueShopping = function(): void {
    inquirer
    .prompt([
        {
            type: "confirm",
            message: "Would you like to continue shopping?",
            name: "confirm",
            default: true
        }
    ])
    .then((response) => {
        if (response.confirm) {
            drawTable();
        }
        else {
            console.log("We hope to see you again soon!");
            disconnectFromDB();
        }
    })
}
// ------------------------------------------------------------------------------

connectToDB();
drawTable();