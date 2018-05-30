"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = require("inquirer");
var createDbConnection_1 = require("./createDbConnection");
var createDbConnection_2 = require("./createDbConnection");
var tableMaker_1 = require("./tableMaker");
var tableMaker_2 = require("./tableMaker");
var bamazonLogo_1 = require("./bamazonLogo");
// this is used to build out the main menu
var Choices = /** @class */ (function () {
    function Choices(id, name) {
        this.id = id;
        this.name = name;
    }
    return Choices;
}());
// this holds the items that constitute the main menu
var choices = [];
// this takes item ids and names from the db, packages them into objects, and pushes the object into the choices array
var pushToChoices = function (id, name) {
    choices.push(new Choices(id, name));
};
// draws the product table
var displayTable = function (query, buildMenu) {
    createDbConnection_1.connection.query(query, function (err, res) {
        if (err)
            throw err;
        // populate the menu.  this is not used by some of the menu options, so let's short circuit it when appropriate
        // this if statement short circuits the for loop if buildMenu is false or undefined, saving us some computation!  woot
        if (buildMenu || false) {
            choices = [];
            for (var i = 0; i < res.length; i++) {
                pushToChoices(res[i].item_id, res[i].product_name);
            }
        }
        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        tableMaker_1.sendTitles(["DEPARTMENT ID", "DEPARTMENT", "OVERHEAD COSTS", "PRODUCT SALES", "DEPARTMENT REVENUE"]);
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        console.log(res);
        tableMaker_2.makeTable(res);
    });
};
var mainMenu = function () {
    inquirer
        .prompt([
        {
            type: "list",
            message: "Welcome, supervisor!  What would you like to do?",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"],
            name: "manage"
        }
    ])
        .then(function (response) {
        switch (response.manage) {
            case "View Product Sales by Department":
                displayTable("SELECT d.department_id,	p.department_name, d.over_head_costs, SUM(p.product_sales) AS 'product_sales', (SUM(p.product_sales) - d.over_head_costs) AS 'department_revenue' FROM products p INNER JOIN departments d ON p.department_name = d.department_name GROUP BY d.department_id");
                setTimeout(mainMenu, 100);
                break;
            case "Create New Department":
                // code here
                setTimeout(mainMenu, 100);
                break;
            case "Quit":
                createDbConnection_2.disconnectFromDB();
                break;
        }
    });
};
// ------------------------------------------------------------------------------
bamazonLogo_1.printLogo();
setTimeout(mainMenu, 420);
