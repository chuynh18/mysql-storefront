USE bamazon;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    maker VARCHAR(80) NULL,
    product_description VARCHAR(500) NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales DECIMAL (10,2) DEFAULT 0,
    PRIMARY KEY (item_id)
);