import express from 'express';
import { engine } from 'express-handlebars';
import pg from "pg";
import dotenv from 'dotenv';
import session from 'express-session';

import * as model from './model/model.mjs';

dotenv.config();

const sessionConf = {
    name: "supper-session",
    secret: process.env.secret,
    cookie: {maxAge: 1000 * 60 * 60, sameSite: true},
    resave: false,
    saveUninitialized: false,
    secure: true
}

const port = process.env.PORT || 3000;

const app = express();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(session(sessionConf));

app.get('/', (req, res) => {
    const usertype = req.session.usertype;

    switch (usertype) {
        case 'restaurant':
            model.getOrders(req.session.userId, async (err, orders) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    for (let order of orders) {
                        switch (order.status) {
                            case "incoming":
                                order.incoming = 1;
                                break;
                            case "outgoing":
                                order.outgoing = 1;
                                break;
                            case "ready":
                                order.ready = 1;
                                break;
                            case "transit":
                                order.transit = 1;
                                break;
                        }
                        await model.getFoodFromCart(order.cart_id, (err, data) => {
                            if(err){
                                return console.error(err.message);
                            }
                            else {
                                order.food = data;
                            }
                        });
                    }
                    res.render('index_restaurant', {"orders": orders});
                }
            });
            break;
        case 'driver':
            if (!req.session.zip) {
                model.getDriverInfo(req.session.userId, (err, info) => {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        res.render('delivery_page', {"page1": 1, "info": info[0]});
                    }
                });
            }
            else {
                model.getAssignedOrder(req.session.userId, (err, assigned_order) => {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        if (assigned_order.length === 0) {
                            model.getAllUnassignedOrdersWithStatusAndZip("ready", req.session.zip, (err, orders) => {
                                if(err){
                                    return console.error(err.message);
                                }
                                else {
                                    if (!orders.length) {
                                        res.render('delivery_page', {"page2": 1});
                                    }
                                    else {
                                        if (!req.session.next) {
                                            req.session.next = 1;
                                        }
                                        else {
                                            req.session.next++;
                                        }
                                        res.render('delivery_page', {
                                            "page3": 1,
                                            "order": orders[req.session.next % orders.length]
                                        });
                                    }
                                }
                            });
                        }
                        else {
                            res.render('delivery_page', {"page4": 1, "order": assigned_order[0]});
                        }
                    }  
                });
            }
            break;
        case 'customer':
            res.render('index', {username: req.session.username});
            break;
        default:
            res.render('index', {username: req.session.username});
    }
});
app.get('/login', (req, res) => {
    if (req.session.userId) {
        // console.log("User already logged in");
        // console.log(req.session.userId);
        res.redirect("/");
    }
    else {
        res.render('sign_log');
    }
});
app.get('/restaurants', (req, res) => {
    model.getCategories((err, categories) => {
        if(err){
            return console.error(err.message);
        }
        else {
            model.getRestaurants(req.query.query, req.query.sort, req.query.filter, req.query.zip, (err, restaurants) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    res.render('restaurants', {
                        "username": req.session.username,
                        "categories": categories,
                        "restaurants": restaurants,
                        "count": restaurants.length
                    });
                }
            });
        }
    });
});
app.get('/signup-restaurant', (req, res) => res.render('sign_up_restaurant'));
app.get('/signup-driver', (req, res) => res.render('sign_up_driver'));
app.get('/restaurant', (req, res) => {
    model.getRestaurantById(req.query.id, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            model.getFoodProducts(req.query.id, req.query.query, (err, products) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    if (req.session.userId) {
                        model.getRatingByCustomer(req.session.userId, req.query.id, (err, rating) => {
                            if(err){
                                return console.error(err.message);
                            }
                            else {
                                res.render('res_page', {
                                    "username": req.session.username,
                                    "info": data[0],
                                    "products": products,
                                    "my_rating": rating[0]
                                });
                            }  
                        });
                    }
                    else {
                        res.render('res_page', {
                            "username": req.session.username,
                            "info": data[0],
                            "products": products,
                            "my_rating": null
                        });
                    }
                }  
            });
        }  
    });
});

app.get("/signout", (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post("/signup", (req, res) => {
    model.createCustomer(req.body.email, req.body.password, req.body.phone, (err, data) => {
        if(err){
            // console.log("this email is already in use!");
            res.render("sign_log", {"message1": "Αυτό το email χρησιμοποιείται ήδη!"});
        }
        else {
            res.render("sign_up_success");
        }  
    });
});

app.post("/login", (req, res) => {
    if (req.session.userId) {
        console.log("User already logged in");
        console.log(req.session.userId);
        res.redirect("/");
    }
    else {
        model.getUser(req.body.email, req.body.password, (err, data) => {
            if (err) {
                return console.error(err.message);
            }
            else {
                if (data[0]) {
                    // login successful
                    // console.log("login successful");
                    // console.log(data[0].id);
                    req.session.userId = data[0].id;
                    req.session.username = data[0].email;
                    req.session.usertype = data[0].usertype;
                    res.redirect("/");
                }
                else {
                    // wrong credentials
                    // console.log("wrong credentials");
                    res.render("sign_log", {"message2": "Λάθος στοιχεία!"});
                }
            }
        });
    }
});

app.post("/signup-restaurant", (req, res) => {
    model.createRestaurant(req.body.email, req.body.password, req.body.name, req.body.phone, req.body.resName, req.body.city, req.body.address, req.body.adnumber, req.body.resTime, req.body.resMin, (err, data) => {
        if(err){
            console.log("this email is already in use!");
            res.render("sign_up_restaurant");
            return console.error(err.message);
        }
        else {
            model.createMenu(data[0].user_id, (err, data) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    res.render("sign_up_success");
                }  
            });
        }  
    });
});

app.post("/signup-driver", (req, res) => {
    model.createDriver(req.body.email, req.body.password, req.body.name, req.body.zip, (err, data) => {
        if(err){
            console.log("this email is already in use!");
            res.render("sign_up_restaurant");
            return console.error(err.message);
        }
        else {
            res.render("sign_up_driver_success");
        }  
    });
});

app.post("/placeorder", (req, res) => {
    if (req.session.userId) {
        model.getCustomerCart(req.session.userId, (err, cart_id) => {
            if(err){
                return console.error(err.message);
            }
            else {
                model.clearCart(cart_id[0].cart_id, (err, data) => {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        model.addToCart(cart_id[0].cart_id, req.body.order, (err, data) => {
                            if(err){
                                return console.error(err.message);
                            }
                            else {
                                res.redirect(303, "/order-overview");
                            }  
                        });
                    }
                });
            }  
        });
    }
    else {
        res.redirect(303, "/login");
    }
});

app.post("/rate", (req, res) => {
    if (req.session.userId) {
        model.deleteRating(req.session.userId, req.body.restaurant_id, (err, data) => {
            if(err){
                return console.error(err.message);
            }
            else {
                model.addRating(req.session.userId, req.body.restaurant_id, req.body.rating, (err, data) => {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        res.redirect(303, "/restaurant?id=" + req.body.restaurant_id);
                    }  
                });
            }  
        });
    }
    else {
        res.redirect(303, "/login");
    }
});

app.get("/order-overview", (req, res) => {
    model.getCustomerDetails(req.session.userId, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            model.getFoodFromCart(data[0].cart_id, (err, food) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    // console.log(food);
                    res.render('order_overview', {
                        "username": req.session.username,
                        "info": data[0],
                        "food": food,
                        "restaurant_id": food[0].restaurant_id
                    });
                }  
            });
        }  
    });
});

app.post("/order-overview", (req, res) => {
    if (req.session.userId) {
        model.getCustomerDetails(req.session.userId, (err, data) => {
            if(err){
                return console.error(err.message);
            }
            else {
                model.calculateCartCost(data[0].cart_id, (err, cost) => {
                    if(err){
                        return console.error(err.message);
                    }
                    else {
                        model.submitOrder(req.session.userId, data[0].cart_id, req.body.name, req.body.phone, req.body.address, req.body.floor, req.body.comments, cost[0].total, req.body.restaurant_id, (err, order) => {
                            if(err){
                                return console.error(err.message);
                            }
                            else {
                                model.createCart((err, cart) => {
                                    if(err){
                                        return console.error(err.message);
                                    }
                                    else {
                                        model.switchCart(req.session.userId, cart[0].id, (err, data) => {
                                            if(err){
                                                return console.error(err.message);
                                            }
                                            else {
                                                res.redirect("/");
                                            }  
                                        });
                                    }  
                                });
                            }  
                        });
                    }  
                });
            }  
        });
    }
});

app.post("/switchorderstatus", (req, res) => {
    model.switchOrderStatus(req.body.order_id, req.body.new_status, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/");
        }  
    });
});

app.post("/driver", (req, res) => {
    req.session.zip = req.body.zip;
    res.redirect(303, "/");
});

app.post("/acceptorder", (req, res) => {
    model.assignDriverToOrder(req.body.order_id, req.session.userId, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/");
        }  
    });
});

app.post("/finishorder", (req, res) => {
    model.finishOrder(req.body.order_id, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/");
        }  
    });
});

app.get("/edit-info", (req, res) => {
    model.getRestaurantById(req.session.userId, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            model.getFoodProducts(req.session.userId, "", (err, products) => {
                if(err){
                    return console.error(err.message);
                }
                else {
                    model.getMenuId(req.session.userId, (err, menu_id) => {
                        if(err){
                            return console.error(err.message);
                        }
                        else {
                            res.render('alter_menu', {
                                "menu_id": menu_id[0].id,
                                "info": data[0],
                                "products": products
                            });
                        }  
                    });
                }  
            });
        }  
    });
});

app.post("/edit-info/update", (req, res) => {
    model.updateProduct(req.body.menu_id, req.body.product_id, req.body.name, req.body.ingredients, req.body.price, req.body.description, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/edit-info");
        }  
    });
});

app.post("/edit-info/remove", (req, res) => {
    model.removeProduct(req.body.menu_id, req.body.product_id, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/edit-info");
        }  
    });
});

app.post("/edit-info/add", (req, res) => {
    model.addProduct(req.body.menu_id, req.body.name, req.body.ingredients, req.body.price, req.body.description, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/edit-info");
        }  
    });
});

app.post("/edit-info/openon", (req, res) => {
    model.updateOpenOn(req.session.userId, req.body.open_on, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/edit-info");
        }  
    });
});

app.post("/edit-info/category", (req, res) => {
    model.updateCategory(req.session.userId, req.body.category_id, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            res.redirect(303, "/edit-info");
        }  
    });
});

app.post("/edit-info/image", (req, res) => {
    console.log(req.body);
});


app.listen(port, () => console.log('Έτοιμο!'));