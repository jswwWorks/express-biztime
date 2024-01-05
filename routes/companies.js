"use strict";

/** Routes for companies app. */

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = new express.Router();

/** GET /companies: get list of companies
 *
 *  Returns obj w/ list of companies -> {companies: [{code, name, description}, ...]}
 *  TODO: missing description
*/
router.get('/', async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
      FROM companies`);

  const companies = results.rows;

  return res.json({ companies });
});


/** GET /companies/[code]
 *
 *  Returns obj of company -> {company: {code, name, description}}
*/
router.get('/:code', async function (req, res, next) {

  const code = req.params.code;

  const result = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]);

  if (result.rows.length === 0) {
    throw new NotFoundError(`Company code ${code} not found in database.`);
  }

  const company = result.rows[0];

  return res.json({ company });
});


/** POST /companies
 *
 *  Adds a company to database.
 *
 *  Takes JSON body: {code, name, description}
 *
 *  Returns object (as JSON) that looks like this:
 *  {company: {code, name, description}}
 */
router.post('/', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { code, name, description } = req.body;

  if (code === undefined ||
    name === undefined ||
    description === undefined) {
    throw BadRequestError("Please enter a code, name, and a description.");
  }
  // TODO: ^ can consider using try/catch into db to check instead

  let result;

  try {
    result = await db.query(
      `INSERT INTO companies (code, name, description)
        values ($1, $2, $3)
        RETURNING code, name, description`,
      [code, name, description], // fun fact: this is a trailing comma
    );
  } catch (err) {
    throw new BadRequestError("Company code or company name already in use.");
  }

  // TODO: consider taking the name the user inputs as a name.toLowerCase()
  // for code, sluggify method, etc (but replace spaces w/ dashes)

  const company = result.rows[0];

  return res.status(201).json({ company });
});


/** PUT /companies/[code]
 *
 *  Completely edits an existing company.
 *
 *  Takes JSON body: {name, description}
 *
 *  Returns updated company object: {company: {code, name, description}}
 *
 *  Should return 404 if company cannot be found.
*/
router.put('/:code', async function (req, res, next) {
  console.log('req.body:', req.body);
  if (req.body === undefined) throw new BadRequestError("nothing in body");
  // FIXME: ^ this doesn't trigger properly
  // TODO: sending an empty JSON body in Insomnia is still sending a body

  const code = req.params.code;

  const { name, description } = req.body;

  // if (name === undefined || description === undefined) {
  //   console.log('name or description empty');
  //   throw new BadRequestError("Please enter a name and a description.");
  // }
  // TODO: ^ can be checked in db instead in the try/catch
  // just checked: it works!

  let result;
  try {
    result = await db.query(
      `UPDATE companies
        SET name = $1,
            description = $2
        WHERE code = $3
        RETURNING code, name, description`,
      [name, description, code],
    );
  } catch (err) {
    throw new BadRequestError("All company names and codes must be unique.");
  }

  if (result.rows.length === 0) {
    console.log("code reached");
    throw new NotFoundError(`Company code ${code} not found in database.`);
  }
  // TODO: ^ db can potentially catch this instead

  const company = result.rows[0];

  return res.json({ company });

});


/** DELETE /companies/[code]
 *
 *  Deletes company.
 *
 *  Returns {status: "deleted"}
 *
 *  Should return 404 if company cannot be found.
 */
router.delete('/:code', async function (req, res, next) {

  const code = req.params.code;

  const result = await db.query(
      `DELETE FROM companies
        WHERE code = $1
        RETURNING code, name, description`,
      [req.params.code],
    );

  if (result.rows.length === 0) {
    throw new NotFoundError(`Company code ${code} not found in database.`);
  }

  return res.json({ status: "deleted" });
});


module.exports = router;