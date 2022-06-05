CREATE TABLE "public.USER" (
	"id" serial NOT NULL UNIQUE,
	"email" TEXT NOT NULL,
	"password_hash" TEXT NOT NULL,
	CONSTRAINT "USER_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.DRIVER" (
	"user_id" integer NOT NULL,
	"first_name" TEXT NOT NULL,
	"last_name" TEXT NOT NULL,
	"tk" TEXT NOT NULL,
	"vehicle" TEXT NOT NULL,
	CONSTRAINT "DRIVER_pk" PRIMARY KEY ("user_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.CUSTOMER" (
	"user_id" integer NOT NULL,
	"cart_id" integer NOT NULL,
	"tel" TEXT,
	CONSTRAINT "CUSTOMER_pk" PRIMARY KEY ("user_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.RESTAURANT" (
	"user_id" integer NOT NULL,
	"owner_first_name" TEXT NOT NULL,
	"owner_last_name" TEXT,
	"company_name" TEXT NOT NULL,
	"city" TEXT NOT NULL,
	"street" TEXT NOT NULL,
	"street_number" integer NOT NULL,
	"specialized_category_id" integer,
	"image" bytea,
	"delivery_time" integer,
	"minimum_order" integer,
	"tel" TEXT,
	"open_on" TEXT,
	CONSTRAINT "RESTAURANT_pk" PRIMARY KEY ("user_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.SHOPPING_CART" (
	"id" serial NOT NULL,
	CONSTRAINT "SHOPPING_CART_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.MENU" (
	"id" serial NOT NULL,
	"restaurant_id" integer NOT NULL,
	CONSTRAINT "MENU_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.CATEGORY" (
	"id" serial NOT NULL,
	"name" TEXT NOT NULL,
	CONSTRAINT "CATEGORY_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.DRIVER_TEL" (
	"driver_id" integer NOT NULL,
	"tel" TEXT NOT NULL,
	CONSTRAINT "DRIVER_TEL_pk" PRIMARY KEY ("driver_id","tel")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.RESTAURANT_TEL" (
	"restaurant_id" integer NOT NULL,
	"tel" TEXT NOT NULL,
	CONSTRAINT "RESTAURANT_TEL_pk" PRIMARY KEY ("restaurant_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.FOOD_PRODUCT" (
	"menu_id" integer NOT NULL,
	"product_id" serial NOT NULL,
	"name" TEXT NOT NULL,
	"ingredients" TEXT NOT NULL,
	"price" DECIMAL NOT NULL,
	"description" TEXT NOT NULL,
	CONSTRAINT "FOOD_PRODUCT_pk" PRIMARY KEY ("menu_id","product_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.ORDER" (
	"customer_id" integer NOT NULL,
	"cart_id" integer NOT NULL,
	"order_id" serial NOT NULL,
	"street" TEXT,
	"street_number" TEXT,
	"tk" TEXT,
	"floor_number" TEXT,
	"doorbell" TEXT,
	"cost" DECIMAL,
	"status" TEXT,
	"timestamp" TIMESTAMP DEFAULT current_timestamp,
	"notes" TEXT,
	"assigned_driver_id" integer,
	"delivery_time" TIMESTAMP,
	"paying_customer_id" integer,
	"payment_time" TIMESTAMP,
	"restaurant_id" integer,
	"customer_name" TEXT,
	"customer_phone" TEXT,
	CONSTRAINT "ORDER_pk" PRIMARY KEY ("customer_id","cart_id","order_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.CUSTOMER_RATES_RESTAURANT" (
	"customer_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"rating" integer NOT NULL,
	CONSTRAINT "CUSTOMER_RATES_RESTAURANT_pk" PRIMARY KEY ("customer_id","restaurant_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" (
	"cart_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "SHOPPING_CART_CONTAINS_FOOD_PRODUCT_pk" PRIMARY KEY ("cart_id","menu_id","product_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.ORDER_CONTAINS_FOOD_PRODUCT" (
	"customer_id" integer NOT NULL,
	"cart_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "ORDER_CONTAINS_FOOD_PRODUCT_pk" PRIMARY KEY ("customer_id","cart_id","order_id","menu_id","product_id")
) WITH (
  OIDS=FALSE
);




ALTER TABLE "public.DRIVER" ADD CONSTRAINT "DRIVER_fk0" FOREIGN KEY ("user_id") REFERENCES "public.USER"("id");

ALTER TABLE "public.CUSTOMER" ADD CONSTRAINT "CUSTOMER_fk0" FOREIGN KEY ("user_id") REFERENCES "public.USER"("id");
ALTER TABLE "public.CUSTOMER" ADD CONSTRAINT "CUSTOMER_fk1" FOREIGN KEY ("cart_id") REFERENCES "public.SHOPPING_CART"("id");

ALTER TABLE "public.RESTAURANT" ADD CONSTRAINT "RESTAURANT_fk0" FOREIGN KEY ("user_id") REFERENCES "public.USER"("id");
ALTER TABLE "public.RESTAURANT" ADD CONSTRAINT "RESTAURANT_fk1" FOREIGN KEY ("specialized_category_id") REFERENCES "public.CATEGORY"("id");


ALTER TABLE "public.MENU" ADD CONSTRAINT "MENU_fk0" FOREIGN KEY ("restaurant_id") REFERENCES "public.RESTAURANT"("user_id");


ALTER TABLE "public.DRIVER_TEL" ADD CONSTRAINT "DRIVER_TEL_fk0" FOREIGN KEY ("driver_id") REFERENCES "public.DRIVER"("user_id");

ALTER TABLE "public.RESTAURANT_TEL" ADD CONSTRAINT "RESTAURANT_TEL_fk0" FOREIGN KEY ("restaurant_id") REFERENCES "public.RESTAURANT"("user_id");

ALTER TABLE "public.FOOD_PRODUCT" ADD CONSTRAINT "FOOD_PRODUCT_fk0" FOREIGN KEY ("menu_id") REFERENCES "public.MENU"("id");

ALTER TABLE "public.ORDER" ADD CONSTRAINT "ORDER_fk0" FOREIGN KEY ("customer_id") REFERENCES "public.CUSTOMER"("user_id");
ALTER TABLE "public.ORDER" ADD CONSTRAINT "ORDER_fk1" FOREIGN KEY ("cart_id") REFERENCES "public.SHOPPING_CART"("id");
ALTER TABLE "public.ORDER" ADD CONSTRAINT "ORDER_fk2" FOREIGN KEY ("assigned_driver_id") REFERENCES "public.DRIVER"("user_id");
ALTER TABLE "public.ORDER" ADD CONSTRAINT "ORDER_fk3" FOREIGN KEY ("paying_customer_id") REFERENCES "public.CUSTOMER"("user_id");
ALTER TABLE "public.ORDER" ADD CONSTRAINT "ORDER_fk4" FOREIGN KEY ("restaurant_id") REFERENCES "public.RESTAURANT"("user_id");

ALTER TABLE "public.CUSTOMER_RATES_RESTAURANT" ADD CONSTRAINT "CUSTOMER_RATES_RESTAURANT_fk0" FOREIGN KEY ("customer_id") REFERENCES "public.CUSTOMER"("user_id");
ALTER TABLE "public.CUSTOMER_RATES_RESTAURANT" ADD CONSTRAINT "CUSTOMER_RATES_RESTAURANT_fk1" FOREIGN KEY ("restaurant_id") REFERENCES "public.RESTAURANT"("user_id");

ALTER TABLE "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" ADD CONSTRAINT "SHOPPING_CART_CONTAINS_FOOD_PRODUCT_fk0" FOREIGN KEY ("cart_id") REFERENCES "public.SHOPPING_CART"("id");
ALTER TABLE "public.SHOPPING_CART_CONTAINS_FOOD_PRODUCT" ADD CONSTRAINT "SHOPPING_CART_CONTAINS_FOOD_PRODUCT_fk1" FOREIGN KEY ("menu_id","product_id") REFERENCES "public.FOOD_PRODUCT"("menu_id","product_id") ON DELETE CASCADE;

ALTER TABLE "public.ORDER_CONTAINS_FOOD_PRODUCT" ADD CONSTRAINT "ORDER_CONTAINS_FOOD_PRODUCT_fk0" FOREIGN KEY ("customer_id","cart_id","order_id") REFERENCES "public.ORDER"("customer_id","cart_id","order_id");
ALTER TABLE "public.ORDER_CONTAINS_FOOD_PRODUCT" ADD CONSTRAINT "ORDER_CONTAINS_FOOD_PRODUCT_fk3" FOREIGN KEY ("menu_id","product_id") REFERENCES "public.FOOD_PRODUCT"("menu_id","product_id") ON DELETE CASCADE;


INSERT INTO "public.CATEGORY" ("name") VALUES ('Καφέδες');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Σουβλάκια');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Pizza');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Κινέζικη');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Κρέπες');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Burgers');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Sushi');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Γλυκά');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Μαγειρευτά');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ζυμαρικά');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Μεξικάνικη');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Νηστίσιμα');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Βάφλες');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Vegetarian');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ασιατική');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Σφολιάτες');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Θαλασσινά');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Σαλάτες');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Κουλούρια');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ζαχαροπλαστείο');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Cocktails');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ιταλική');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Παγωτό');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ελληνική');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Μεσογειακή');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Φρέσκοι χυμοί');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Snacks');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Sandwich');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Αρτοποιήματα');
INSERT INTO "public.CATEGORY" ("name") VALUES ('Ψητά - Grill');


/* test data */
INSERT INTO "public.USER" VALUES (default, 'a@a.a', '$2b$10$cniLqQ3UIpJpLF2ZYpaLDe8d2Akcw.A6mZe2G7JQ30raNQXNDQ3ca');
INSERT INTO "public.USER" VALUES (default, 'b@b.b', '$2b$10$3YNU24hp8WlQPLm81i2wdOk5O4sGezIcJOCfJix.GGRJt5ehcl77C');
INSERT INTO "public.USER" VALUES (default, 'c@c.c', '$2b$10$IeDIW0Zz/6Su7NniZndDU.1Atzn628cW5UWrEaN1MEBkd.5WwSkBq');
INSERT INTO "public.RESTAURANT" VALUES (1, 'a', 'aa', 'aaa', 'a', 'a', 1, 1, NULL, 10, 5, '12345-67890', 'Δευτέρα: ..-.. <br>Τρίτη: ..-..<br>
                                Τετάρτη: ..-.. <br>Πέμπτη: ..-..<br>
                                Παρασκευή: ..-.. <br>Σάββατο: ..-..<br>
                                Κυριακή: ..-..');
INSERT INTO "public.MENU" ("restaurant_id") VALUES (1);
INSERT INTO "public.FOOD_PRODUCT" ("menu_id", "name", "ingredients", "price", "description") VALUES (1, 'Σουβλάκι Χοιρινό', 'Πατάτες Ντομάτες', 3, 'επιλογες αναλογα με το φαγητο');
INSERT INTO "public.FOOD_PRODUCT" ("menu_id", "name", "ingredients", "price", "description") VALUES (1, 'Σουβλάκι Κοτόπουλο', 'Πατάτες Ντομάτες', 5.5, 'επιλογες αναλογα');
INSERT INTO "public.SHOPPING_CART" VALUES (default);
INSERT INTO "public.CUSTOMER" VALUES (2, 1, '12345-67890');
INSERT INTO "public.CUSTOMER_RATES_RESTAURANT" VALUES (2, 1, 4);
INSERT INTO "public.DRIVER" VALUES (3, 'ccc ccc', '', '123 45', '');
