var inquirer = require('inquirer');
var mysql = require('mysql');
var input1 = process.argv[2];

var connection = mysql.createConnection({
     host: 'localhost',
     port: 3306,
     user: 'root',
     password: 'password',
     database: "bamazon"
});

connection.connect(function(err) {
     if (err) throw err;
     //console.log("connected as id " + connection.threadId);
});


function showInventory() {
     connection.query('SELECT * FROM products', function(err, inventory) {
     	if (err) throw err;
               console.log("Bamazon's Inventory");
               for(var i = 0; i < inventory.length; i++) {
          	console.log("Item ID: " + inventory[i].item_id + 
          		" | Product: " + inventory[i].product_name + 
          		" | Department: " + inventory[i].department_name + 
          		" | Price: " +  inventory[i].price + 
          		" | Quantity: " + inventory[i].stock_quantity);
          }

          inquirer.prompt([

          	{
          		type: "input",
          		message: "What is the id of the item you would like to buy?",
          		name: "id"
          	},

               {
          		type: "input",
          		message: "How many would you like to buy?",
          		name: "quantity"
          	}

          ]).then(function (order) {
               //console.log(JSON.stringify(order, null, 2));
                    var quantity = order.quantity;
                    var itemId = order.id;
                    connection.query('SELECT * FROM products WHERE item_id=' + itemId, function(err, selectedItem) {
                         if (err) throw err;
                         if (selectedItem[0].stock_quantity - quantity >= 0) {
                              console.log("Bamazon's Inventory has enough of that item ("+ selectedItem[0].product_name +")!");
                              console.log("Quantity in Stock: "+ selectedItem[0].stock_quantity + " Order Quantity: "+ quantity);
                              console.log("You will be charged "+ (order.quantity * selectedItem[0].price) +  " dollars.  Thank you for shopping at Bamazon.");
                              //  This is the code to remove the item from inventory.
                              connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [selectedItem[0].stock_quantity - quantity, itemId],
                              function(err, inventory) {
                                   if (err) throw err;
                                   // Runs the prompt again, so the user can keep shopping.
                                   showInventory();
                              });  // Ends the code to remove item from inventory.

                         }

                         else {
                              console.log("Insufficient quantity.  Please order less of that item, as Bamazon only has " +selectedItem[0].stock_quantity + " " + selectedItem[0].product_name + " in stock at this moment.");
                              showInventory();
                         }
                    });
          });
     });
}

showInventory();