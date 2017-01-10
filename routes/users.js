/* eslint-disable camelcase, max-len */

'use strict';

const express = require('express');
const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const { camelizeKeys } = require('humps');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/users', (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }
  if (!pw || pw.length < 8) {
    return next(boom.create(400, 'Password must be at least 8 characters long'));
  }

  knex('users')
    .where('email', email)
    .then((emails) => {
      if (emails.length) {
        return next(boom.create(400, 'Email already exists'));
      }
    })
    .then(() => {
      return bcrypt.hash(pw, 12)
      .then((hashed_password) => {
        return knex('users')
        .insert({
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: email,
          hashed_password: hashed_password
        }, '*');
      })
      .then((users) => {
        const user = users[0];

        delete user.hashed_password;
        res.send(camelizeKeys(user));
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
