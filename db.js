"use strict";

/** Database setup for BizTime. */

const { Client } = require("pg");

// Step 1: pick the database (and set the proper database for testing)
const DB_URI = process.env.NODE_ENV === "test"
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

let db = new Client({
  connectionString: DB_URI
});


// Step 2: connect to the desired database
db.connect();


// Step 3: Export the databse so it can be used in your program
module.exports = db;