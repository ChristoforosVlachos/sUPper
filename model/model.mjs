import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export async function connect() {
    try {
        const client = await pool.connect();
        return client
    }
    catch(e) {
        console.error(`Failed to connect ${e}`)
    }
}

export async function createUser(email, password, callback) {
    const password_hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO "public.USER" ("email", "password_hash") VALUES ('${email}', '${password_hash}') RETURNING "id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function createCart(callback) {
    const sql = `INSERT INTO "public.SHOPPING_CART" VALUES (default) RETURNING "id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function createCustomer(email, password, phone, callback) {
    let user_id;
    await createUser(email, password, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            user_id = data[0].id;
        }  
    });
    let cart_id;
    await createCart((err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            cart_id = data[0].id;
        }  
    });
    const sql = `INSERT INTO "public.CUSTOMER" VALUES (${user_id}, ${cart_id}, '${phone}');`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getUser(email, password, callback) {
    const sql = `SELECT * FROM "public.USER" WHERE "email"='${email}';`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        bcrypt.compare(password, res.rows[0].password_hash, async (err, match) => {
            if (match) {
                const usertype = await getUserType(res.rows[0].id);
                res.rows[0].usertype = usertype;
                callback(null, res.rows) // επιστρέφει array
            }
            else {
                callback(null, {});
            }
        });
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getUserType(id) {
    try {
        const client = await connect();
        let sql = `SELECT user_id FROM "public.CUSTOMER" WHERE "user_id"='${id}';`;
        let res = await client.query(sql);
        if (res.rows[0]) {
            await client.release();
            return "customer";
        }
        sql = `SELECT user_id FROM "public.RESTAURANT" WHERE "user_id"='${id}';`;
        res = await client.query(sql);
        if (res.rows[0]) {
            await client.release();
            return "restaurant";
        }
        sql = `SELECT user_id FROM "public.DRIVER" WHERE "user_id"='${id}';`;
        res = await client.query(sql);
        if (res.rows[0]) {
            await client.release();
            return "driver";
        }
        await client.release();
        return "";
    }
    catch (err) {
        console.error(err);
        return "";
    }
}

export async function createRestaurant(email, password, owner_first_name, phone, company_name, city, street, street_number, delivery_time, minimum_order, callback) {
    let user_id;
    await createUser(email, password, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            user_id = data[0].id;
        }  
    });
    const sql = `INSERT INTO "public.RESTAURANT" VALUES (${user_id}, '${owner_first_name}', NULL, '${company_name}', '${city}', '${street}', ${street_number}, NULL, NULL, ${delivery_time}, ${minimum_order}, '${phone}', 'Δευτέρα: ..-.. <br>Τρίτη: ..-..<br>
    Τετάρτη: ..-.. <br>Πέμπτη: ..-..<br>
    Παρασκευή: ..-.. <br>Σάββατο: ..-..<br>
    Κυριακή: ..-..') RETURNING "user_id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function createDriver(email, password, name, tk, callback) {
    let user_id;
    await createUser(email, password, (err, data) => {
        if(err){
            return console.error(err.message);
        }
        else {
            user_id = data[0].id;
        }  
    });
    const sql = `INSERT INTO "public.DRIVER" VALUES (${user_id}, '${name}', '', '${tk}', '');`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getCategories(callback) {
    const sql = `SELECT * FROM "public.CATEGORY";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getRestaurants(term, order, filters, zip, callback) {
    let orderCol;
    switch (order) {
        case "name":
            orderCol = "company_name";
            break;
        case "deliverytime":
            orderCol = "delivery_time";
            break;
        case "minimumorder":
            orderCol = "minimum_order";
            break;
        case "rating":
            orderCol = "avg_rating";
            break;
        default:
            orderCol = "company_name";
    }
    let sql;
    let sql_filter;
    if (Array.isArray(filters) || Number.isInteger(parseInt(filters))) {
        if (Array.isArray(filters)) {
            const filt = [];
            for (let f of filters) {
                filt.push('"id" = ' + f);
            }
            sql_filter = filt.join(" OR ");
        }
        else {
            sql_filter = '"id" = ' + filters;
        }

        if (term) {
            if (zip) {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                        FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                        GROUP BY "user_id") AS r
                WHERE "city" LIKE '${zip}' AND "company_name" ILIKE '%${term}%' AND (${sql_filter})
                ORDER BY "${orderCol}"`;
            }
            else {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE "company_name" ILIKE '%${term}%' AND (${sql_filter})
                ORDER BY "${orderCol}"`;
            }
        }
        else {
            if (zip) {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE "city" LIKE '${zip}' AND (${sql_filter})
                ORDER BY "${orderCol}"`;
            }
            else {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE (${sql_filter})
                ORDER BY "${orderCol}"`;
            }
        }
    }
    else {
        if (term) {
            if (zip) {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE "city" LIKE '${zip}' AND "company_name" ILIKE '%${term}%'
                ORDER BY "${orderCol}"`;
            }
            else {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE "company_name" ILIKE '%${term}%'
                ORDER BY "${orderCol}"`;
            }
        }
        else {
            if (zip) {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                WHERE "city" LIKE '${zip}'
                ORDER BY "${orderCol}"`;
            }
            else {
                sql = `SELECT "user_id" as "rid", "id" as "cid", "company_name" as "rname", "name" as "cname", "avg_rating", "delivery_time", "minimum_order"
                FROM ("public.RESTAURANT" LEFT OUTER JOIN "public.CATEGORY" ON "specialized_category_id"="id")
                NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                         FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                         GROUP BY "user_id") AS r
                ORDER BY "${orderCol}"`;
            }
        }
    }

    if (order === "rating") {
        sql = sql + " DESC NULLS LAST;";
    }
    else {
        sql = sql + " ASC;";
    }
    
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getRestaurantById(id, callback) {
    let sql = `SELECT "user_id" as "rid", "company_name" as "rname", "avg_rating", "city", "street", "street_number", "tel", "open_on"
    FROM "public.RESTAURANT" NATURAL LEFT OUTER JOIN (SELECT "user_id", ROUND(AVG("rating")::numeric, 2) as "avg_rating"
                                                      FROM "public.RESTAURANT" JOIN "public.CUSTOMER_RATES_RESTAURANT" ON "user_id"="restaurant_id"
                                                      GROUP BY "user_id") AS r
    WHERE "user_id" = ${id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getFoodProducts(restaurant_id, query, callback) {
    let sql;
    if (query) {
        sql = `SELECT * FROM "public.MENU" JOIN "public.FOOD_PRODUCT" ON "menu_id" = "id"
               WHERE "restaurant_id" = ${restaurant_id} AND "name" ILIKE '%${query}%'
               ORDER BY "product_id";`;
    }
    else {
        sql = `SELECT * FROM "public.MENU" JOIN "public.FOOD_PRODUCT" ON "menu_id" = "id"
               WHERE "restaurant_id" = ${restaurant_id}
               ORDER BY "product_id";`;
    }
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getRatingByCustomer(customer_id, restaurant_id, callback) {
    let sql = `SELECT "rating" FROM "public.CUSTOMER_RATES_RESTAURANT"
               WHERE "customer_id" = ${customer_id} AND "restaurant_id" = ${restaurant_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getCustomerCart(customer_id, callback) {
    let sql = `SELECT "cart_id" FROM "public.CUSTOMER" WHERE "user_id" = ${customer_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function clearCart(cart_id, callback) {
    let sql = `DELETE FROM "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" WHERE "cart_id" = ${cart_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function addToCart(cart_id, order, callback) {
    for (let food of order) {
        const menu_id = food[5];
        const product_id = food[6];
        const quantity = food[2];
        let sql = `INSERT INTO "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" VALUES (${cart_id}, ${menu_id}, ${product_id}, ${quantity});`;
        try {
            const client = await connect();
            const res = await client.query(sql);
            await client.release();
        }
        catch (err) {
            callback(err, null);
        }
    }
    callback(null, "success");
}

export async function deleteRating(customer_id, restaurant_id, callback) {
    let sql = `DELETE FROM "public.CUSTOMER_RATES_RESTAURANT"
               WHERE "customer_id" = ${customer_id} AND "restaurant_id" = ${restaurant_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function addRating(customer_id, restaurant_id, rating, callback) {
    // MAKE SURE NO OTHER RATING EXISTS FOR THIS PARTICULAR (customer_id, restaurant_id) PAIR!
    let sql = `INSERT INTO "public.CUSTOMER_RATES_RESTAURANT" VALUES (${customer_id}, ${restaurant_id}, ${rating});`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getCustomerDetails(customer_id, callback) {
    let sql = `SELECT * FROM "public.CUSTOMER" WHERE "user_id" = ${customer_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getFoodFromCart(cart_id, callback) {
    let sql = `SELECT *, "quantity"*"price" AS "total"
               FROM ("public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" NATURAL JOIN "public.FOOD_PRODUCT")
               JOIN "public.MENU" ON "menu_id" = "id"
               WHERE "cart_id" = ${cart_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function calculateCartCost(cart_id, callback) {
    let sql = `SELECT SUM("subtotal") AS "total"
               FROM (SELECT "quantity"*"price" AS "subtotal"
                     FROM "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" NATURAL JOIN "public.FOOD_PRODUCT"
                     WHERE "cart_id" = ${cart_id}) AS s`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function submitOrder(customer_id, cart_id, name, phone, street, floor_number, notes, cost, restaurant_id, callback) {
    let sql = `INSERT INTO "public.ORDER" VALUES (${customer_id}, ${cart_id}, DEFAULT, '${street}',
               NULL, NULL, ${floor_number}, NULL, ${cost}, 'incoming', DEFAULT, '${notes}', NULL,
               NULL, NULL, NULL, ${restaurant_id}, '${name}', '${phone}') RETURNING "order_id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function createNewCart(callback) {
    let sql = `INSERT INTO "public.SHOPPING_CART" VALUES (DEFAULT) RETURNING "cart_id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function switchCart(customer_id, cart_id, callback) {
    let sql = `UPDATE "public.CUSTOMER" SET "cart_id" = ${cart_id} WHERE "user_id" = ${customer_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getOrders(restaurant_id, callback) {
    let sql = `SELECT * FROM "public.ORDER" WHERE "restaurant_id" = ${restaurant_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function switchOrderStatus(order_id, new_status, callback) {
    let sql = `UPDATE "public.ORDER" SET "status" = '${new_status}' WHERE "order_id" = ${order_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getDriverInfo(driver_id, callback) {
    let sql = `SELECT * FROM "public.DRIVER" WHERE "user_id" = ${driver_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getAllUnassignedOrdersWithStatusAndZip(status, zip, callback) {
    // status = {incoming, outgoing, ready, transit, delivered}
    let sql = `SELECT "order_id", "public.RESTAURANT"."company_name" AS "rname", "public.RESTAURANT"."street" AS "rstreet",
               "public.RESTAURANT"."street_number" AS "rstreetno", "public.RESTAURANT"."city" AS "rcity",
               "public.ORDER"."street" AS "ostreet", "public.ORDER"."cost" AS "ocost"
               FROM "public.ORDER" JOIN "public.RESTAURANT" ON "user_id" = "restaurant_id"
               WHERE "status" = '${status}' AND "assigned_driver_id" IS NULL AND "city" LIKE '${zip}';`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function assignDriverToOrder(order_id, driver_id, callback) {
    let sql = `UPDATE "public.ORDER" SET "assigned_driver_id" = ${driver_id}, "status" = 'transit' WHERE "order_id" = ${order_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getAssignedOrder(driver_id, callback) {
    let sql = `SELECT "order_id", "company_name", "city", "public.RESTAURANT"."street" AS "rstreet",
               "public.RESTAURANT"."street_number" AS "rstreetno", "public.ORDER"."street" AS "ostreet",
               "floor_number", "customer_name", "cost", "customer_phone", "notes"
               FROM "public.ORDER" JOIN "public.RESTAURANT" ON "restaurant_id" = "user_id"
               WHERE "assigned_driver_id" = ${driver_id} AND "status" != 'delivered'
               LIMIT 1;`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function finishOrder(order_id, callback) {
    let sql = `UPDATE "public.ORDER" SET "status" = 'delivered', "delivery_time" = current_timestamp
               WHERE "order_id" = ${order_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function updateProduct(menu_id, product_id, name, ingredients, price, description, callback) {
    let sql = `UPDATE "public.FOOD_PRODUCT" SET "name" = '${name}', "ingredients" = '${ingredients}',
               "price" = ${price}, "description" = '${description}'
               WHERE "menu_id" = ${menu_id} AND "product_id" = ${product_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function removeProduct(menu_id, product_id, callback) {
    let sql = `DELETE FROM "public.FOOD_PRODUCT"
               WHERE "menu_id" = ${menu_id} AND "product_id" = ${product_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function addProduct(menu_id, name, ingredients, price, description, callback) {
    let sql = `INSERT INTO "public.FOOD_PRODUCT"
               VALUES (${menu_id}, DEFAULT, '${name}', '${ingredients}', ${price}, '${description}');`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function createMenu(restaurant_id, callback) {
    let sql = `INSERT INTO "public.MENU" ("restaurant_id") VALUES (${restaurant_id}) RETURNING "id";`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function updateOpenOn(restaurant_id, open_on, callback) {
    const open_on_f = open_on.replaceAll("\n", "<br>");
    let sql = `UPDATE "public.RESTAURANT" SET "open_on" = '${open_on_f}' WHERE "user_id" = ${restaurant_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function updateCategory(restaurant_id, category_id, callback) {
    let sql = `UPDATE "public.RESTAURANT" SET "specialized_category_id" = ${category_id} WHERE "user_id" = ${restaurant_id};`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

export async function getMenuId(restaurant_id, callback) {
    let sql = `SELECT "id" FROM "public.MENU" WHERE "restaurant_id" = ${restaurant_id} LIMIT 1;`;
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}
