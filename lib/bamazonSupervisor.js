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
var displayTable = function (query, buildMenu, titles) {
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
        if (titles) {
            tableMaker_1.sendTitles(titles);
        }
        else {
            tableMaker_1.sendTitles(["DEPARTMENT ID", "DEPARTMENT", "OVERHEAD COSTS", "PRODUCT SALES", "DEPARTMENT REVENUE"]);
        }
        // send the MySQL query response object to tableMaker.  It handles the rest and will console.log out the table
        tableMaker_2.makeTable(res);
        setTimeout(mainMenu, 200);
    });
};
var addDepartment = function () {
    function notNull(input) {
        if (!input || input === "") {
            return "Sorry, this cannot be blank.  Please enter something";
        }
        else {
            return true;
        }
    }
    function checkForNum(qty) {
        if (qty === "cancel" || qty === "quit") {
            return true;
        }
        else if (/^[0-9]/.test(qty)) {
            return true;
        }
        else {
            return "Please enter a number.";
        }
    }
    inquirer
        .prompt([
        {
            type: "input",
            message: "Enter the new department's name.",
            name: "department",
            validate: notNull
        },
        {
            type: "input",
            message: "Enter the department's overhead costs.",
            name: "overhead",
            validate: checkForNum
        }
    ])
        .then(function (response) {
        confirmCreation(response.department, parseFloat(response.overhead));
    });
};
var confirmCreation = function (dept, overhead) {
    inquirer
        .prompt([
        {
            type: "confirm",
            message: "The " + dept + " department will be created with overhead costs of " + overhead + ".  Please confirm.",
            name: "confirm",
            default: true
        }
    ])
        .then(function (response) {
        if (response.confirm) {
            var query = "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + dept + "', '" + overhead + "')";
            createDbConnection_1.connection.query(query, function (err, res) {
                if (err)
                    throw err;
                console.log("Department added.");
                displayTable("SELECT * FROM bamazon.departments WHERE department_name = '" + dept + "'", false, ["DEPARTMENT ID", "DEPARTMENT NAME", "OVERHEAD COSTS"]);
            });
        }
        else {
            console.log("Department creation canceled.");
            mainMenu();
        }
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
                displayTable("SELECT d.department_id, d.department_name, d.over_head_costs, SUM(IFNULL(p.product_sales, 0)) AS 'product_sales', (SUM(IFNULL(p.product_sales, 0)) - d.over_head_costs) AS 'department_revenue' FROM products p RIGHT JOIN departments d ON p.department_name = d.department_name GROUP BY d.department_id");
                break;
            case "Create New Department":
                addDepartment();
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
