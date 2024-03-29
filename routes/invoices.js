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

});


/** POST /invoices
 *
 *  Adds an invoice to database.
 *
 *  Takes JSON body: { comp_code, amt}
 *
 *  Returns object (as JSON) that looks like this:
 *  {invoice:
 *    {id,
 *     comp_code,
 *     amt, paid,
 *     add_date,
 *     paid_date}
 *  }
 *
 */
router.post('/', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { comp_code, amt } = req.body;

  let result;

  try {
    result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
        values ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt],
    );
  } catch (err) {
    throw new BadRequestError(
      "Amount need to be positive integer or Company Code invalid."
    );
  }

  const invoice = result.rows[0];

  return res.status(201).json({ invoice });
});


/** PUT /invoices/[id]
 *
 *  Completely edits an existing invoice.
 *
 *  Takes JSON body: { amt}
 *
 *  Returns updated invoice object:
 *  {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 *
 *  Should return 404 if invoice cannot be found.
*/
router.put('/:id', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const invoiceId = req.params.id;

  const { amt } = req.body;

  let result;
  try {
    result = await db.query(
      `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, invoiceId],
    );
  } catch (err) {
    throw new BadRequestError("Amount must be more than 0.");
    // TODO: ^ making assumption about error
    // consider not throwing error and letting it propogate error
  }

  if (result.rows.length === 0) {
    console.log("code reached");
    throw new NotFoundError(`Company code ${invoiceId} not found in database.`);
    // TODO: consider writing error message highly structured/terse
  }
  // TODO: ^ db can potentially catch this instead, BUT HOW??

  const invoice = result.rows[0];

  return res.json({ invoice });

});


/** DELETE invoices route */





module.exports = router;