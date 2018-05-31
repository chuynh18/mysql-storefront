MySQL mock storefront
=====================

Compilation (Optional)
----------------------
For your convenience, __compiling the TypeScript source (located in `./src`) is not necessary__.  You'll find the compiled JavaScript in `./lib`.  However, if you wish to compile from source, please ensure that you have TypeScript installed.  TypeScript can be installed globally by running `npm install -g typescript`.  Otherwise, you can install it locally.  First, make sure your current working directory is the root directory of this project.  Then simply run `npm install --save-dev typescript`.  This will install TypeScript as a dependency of this project and update `package.json` accordingly.

Afterward, simply run `tsc`.  The relevant JavaScript files will be generated and placed inside `./lib`.  If there are already files present in `./lib`, they will be overwritten.

__But it's a hell of a lot easier to just run the JavaScript, so I recommend doing that.__

Connecting to and seeding the database
--------------------------------------

First, ensure you have a MySQL instance set up and running locally.  __If your database credentials are different, please make the appropriate edits to the `createDbConnection.ts` file.__  You do not need to make edits anywhere else, as I've modularized the database code to this file.  After making edits, be sure to recompile by running `tsc` in the terminal.

The `sql` files that generate the appropriate tables can be found in `./sql`.

`bamazon_products_schema.sql` and `bamazon_products_seed.sql` are collectively responsible for generating the `products` table.  On the other hand, `bamazon_departments_schema.sql` and `bamazon_departments_seed.sql` generate the `departments` table.

`bamazonCustomer` uses only the `products` table.  `bamazonManager` relies primarily on the `products` table, but does reference the `departments` table to ensure that managers do not add products to departments that don't exist.  `bamazonSupervisor` relies heavily on both tables to provides its functionality.

Please be sure to use these `sql` files to create the relevant tables before running the corresponding programs.

Running the applications
---------------

__bamazonCustomer__

bamazonCustomer is intended to be the customer-facing program.  It allows customers to place orders for items stocked by bamazon.  The `bamazonCustomer.js` file is located in the `lib` subdirectory.  Assuming `lib` is the current working directory, bamazonCustomer is launched by invoking `node bamazonCustomer.js` in the terminal.

Upon launch, a list of products on offer is displayed to the customer, and the customer can browse the menu to purchase an item.

After selecting an item, the customer can select how many of that item he or she would like to purchase.

After entering the number of items to purchase, the customer is offered the chance to finalize or cancel the order.  This confirmation step also displays the specific item being purchased, the number of items to be purchased, and the purchase price.

If the purchase is canceled, the item will not be purchased.  Otherwise, the item is purchased.  Either way, the customer is given the chance to either quit out of the program or to continue shopping.  Should the customer choose to continue shopping, the process begins anew at the main menu.

__bamazonManager__

bamazonManager allows managers to perform several adminstrative actions on the bamazon store.

Managers are able to view the entire inventory by selecting "View Products for Sale".  This displays all items, along with relevant info such as their price and how many of each are in stock.

They're also able to view only items that are low in stock (fewer than 5 items available) by selecting "View Low Inventory".

The next bit of functionality is the ability to add stock by selecting "Add New Product".  This allows managers to select a specific product already in stock, then restock it.

Lastly, managers are able to "Add New Product".  Since only supervisors can create new departments, managers are only able to select from existing departments.  (The assumption is that if new products are coming in that would belong to a new department, supervisors would have already created the relevant department.)

__bamazonSupervisor__

There are only two pieces of functionality for supervisors, but they are both important ones.

Supervisors are able to view important information regarding the business by selecting "View Product Sales by Department".  This gives them a bird's eye view of the state of the business by looking at department overhead versus revenue.

Lastly, supervisors are able to create new departments with the "Create New Department" feature.  New departments created in this manner will show up when "View Product Sales by Department" is selected, even if products haven't yet been added to the new department.