"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import dependencies
var inquirer = require("inquirer");
var createDbConnection_1 = require("./createDbConnection"); // provides mysql npm package + connects to db
var createDbConnection_2 = require("./createDbConnection");
var tableMaker_1 = require("./tableMaker"); // creates tables
var tableMaker_2 = require("./tableMaker");
var bamazonLogo_1 = require("./bamazonLogo"); // prints bamazon logo
// draws the product table
var displayTable = function (query) {
    createDbConnection_1.connection.query(query, function (err, res) {
        if (err)
            throw err;
        // this draws the tables by using my own table-generating code (contained in tableMaker.ts)
        // make sure the number and order of the user-facing titles matches the MySQL query
        tableMaker_1.sendTitles(["DEPARTMENT ID", "DEPARTMENT", "OVERHEAD COSTS", "PRODUCT SALES", "REVENUE MINUS OVERHEAD"]);
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
            createDbConnection_1.connection.query("SELECT department_name FROM bamazon.departments", function (err, res) {
                if (err)
                    throw err;
                var dupe = false;
                res.forEach(function (element) {
                    if (element.department_name.toLowerCase() === dept.toLowerCase()) {
                        dupe = true;
                    }
                });
                if (!dupe) {
                    var query = "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + dept + "', '" + overhead + "')";
                    createDbConnection_1.connection.query(query, function (err, res) {
                        if (err)
                            throw err;
                        console.log("Department added.");
                        displayTable("SELECT d.department_id, d.department_name, d.over_head_costs, SUM(IFNULL(p.product_sales, 0)) AS 'product_sales', (SUM(IFNULL(p.product_sales, 0)) - d.over_head_costs) AS 'department_revenue' FROM products p RIGHT JOIN departments d ON p.department_name = d.department_name WHERE d.department_name = '" + dept + "'");
                    });
                }
                else {
                    console.log("Sorry, the " + dept + " department already exists.  Please try again.");
                    addDepartment();
                }
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
