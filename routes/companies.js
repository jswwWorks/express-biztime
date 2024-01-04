"use strict";

/** Routes for companies app. */

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = new express.Router();

/** GET /items: get list of items */

router.get('/', function (req, res) {
  debugger;
  return res.json({items});
});

module.exports = router;