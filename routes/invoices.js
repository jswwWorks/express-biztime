"use strict";

/** Routes for invoices app. */

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = new express.Router();


/** GET /invoices: get list of all invoices
 *
 *  Returns obj w/ list of invoices, with invoice id and comp_code:
 *  {invoices: [{id, comp_code}, ...]}
 *
*/
router.get('/', async function (req, res, next) {

  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`);

  const invoices = results.rows;

  return res.json({ invoices });
});


/** GET /invoices/id : gets particular invoice based on its id
 *
 *  Returns object of particular invoice with all transaction details:
 *
 *  Example:
 *  {invoice:
 *    {id,
 *     amt,
 *     paid,
 *     add_date,
 *     paid_date,
 *     company: {code, name, description}
 *  }
 *
 *  If invoice cannot be found, returns 404.
 *
 */
router.get('/:id', async function (req, res, next) {

  const id = req.params.id;

  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date
      FROM invoices
      WHERE id = $1`, [id]
  );

  if (invoiceResults.rows.length === 0) {
    throw new NotFoundError(`Invoice id ${id} not found in database.`);
  }

  const invoice = invoiceResults.rows[0];

  const companyResults = await db.query(
    `SELECT companies.code, companies.name, companies.description
      FROM companies
      JOIN invoices ON companies.code = invoices.comp_code
      WHERE invoices.id = $1`, [id]
  );

  invoice.company = companyResults.rows[0];

  return res.json({ invoice });

})




module.exports = router;