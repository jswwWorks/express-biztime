"use strict";

/** Routes for companies app. */

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = new express.Router();

/** GET /companies: get list of companies
 *
 *  Returns obj w/ list of companies -> {companies: [{code, name}, ...]}
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

  if (code === undefined) {
    throw new BadRequestError();
  }

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
router.post('/', async function(req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { code, name, description } = req.body;

  if (code === undefined ||
      name === undefined ||
      description === undefined) {
        throw BadRequestError("Please enter a code, name, and a description.");
  }

  let result;
  try {
    result = await db.query(
      `INSERT INTO companies (code, name, description)
        values ($1, $2, $3)
        RETURNING code, name, description`,
        [code, name, description], // fun fact: this is a trailing comma
    );
  } catch (err) {
    // console.log(err);
    throw new BadRequestError("Company code already in use.");
  }

  const company = result.rows[0];

  return res.status(201).json({ company });
});


/** PUT /companies/[code]
 *
 *  Completely edits an existing company.
 *
 *  Takes JSON body {name, description}
 *
 *  Returns updated company object: {company: {code, name, description}}
 *
 *  Should return 404 if company cannot be found.
*/
router.put('/:code', async function(req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { name, description } = req.body;

  if (name === undefined ||
    description === undefined) {
      throw BadRequestError("Please enter a code, name, and a description.");
}

let result;
  try {
    result = await db.query(
      `UPDATE companies
        SET name = $1,
            description = $2
        WHERE code = $3
        RETURNING code, name, description`,
        [name, description, req.params.code],
    );
  } catch (err) {
    throw new BadRequestError("Duplicate key value violates unique constraint.");
    // Placeholder text for now ^
  }

  if (result.rows.length === 0) {
    throw new NotFoundError(`Company code ${code} not found in database.`);
  }

  const company = result.rows[0];

  return res.json({ company: company });

})

/** DELETE /companies/[code]
 *
 *  Deletes company.
 *
 *  Returns {status: "deleted"}
 *
 *  Should return 404 if company cannot be found.
 */
router.delete('/:code', async function (req, res, next) {
  // console.log('req.params.code:', req.params.code);
  // if (req.params.code === undefined) throw new BadRequestError();

  const code = req.params.code;

  let result;
  try {
    result = await db.query(
      `DELETE FROM companies
        WHERE code = $1
        RETURNING code, name, description`,
        [req.params.code],
    );
  } catch (err) {
    console.log('err', err);
    throw new BadRequestError("Could not delete company.");
    // Placeholder text for now ^
  }

  console.log('This is result', result);
  console.log('This is result.rows', result.rows);
  console.log('This is result.rows.length', result.rows.length);

  if (result.rows.length === 0) {
    throw new NotFoundError(`Company code ${code} not found in database.`);
  }

  return res.json({ status: "deleted" });
})


module.exports = router;