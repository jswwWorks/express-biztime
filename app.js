"use strict";

/** BizTime express application. */

const express = require("express");
const { NotFoundError } = require("./expressError");

const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
const { logger } = require("./middleware");

const app = express();

// json data
app.use(express.json());

// form data
app.use(express.urlencoded());


// Express Router for company routes
app.use("/companies", companyRoutes);

// Express Router for invoice routes
app.use("/invoices", invoiceRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});



module.exports = app;