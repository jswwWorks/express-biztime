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
    throw new BadRequestError(`Company code ${code} not found in database.`);
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

  const { code, name, description } = req.body;

  if (code === undefined ||
      name === undefined ||
      description === undefined) {
        throw BadRequestError("Please enter a code, name, and a description.");
  }

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
      values ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description], // fun fact: this is a trailing comma
  );

  const company = result.rows[0];

  return res.status(201).json({ company });
});



module.exports = router;