'use strict';

const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.user_id')
    .where('favorites.user_id', req.claim.userId)
    .orderBy('books.title')
    .then((rows) => {
      const favorites = camelizeKeys(rows);

      res.send(favorites);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.query.bookId);

  if (Number.isNaN(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('favorites')
    .where({
      book_id: bookId,
      user_id: req.claim.userId
    })
    .first()
    .then((book) => {
      if (!book) {
        return res.send(false);
      }

      res.send(true);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.body.bookId);

  if (Number.isNaN(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Book not found');
      }

      const validFav = { bookId, userId: req.claim.userId };

      return knex('favorites')
        .insert(decamelizeKeys(validFav), '*');
    })
    .then((insert) => {
      const book = camelizeKeys(insert[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  const bookId = Number.parseInt(req.body.bookId);

  if (!Number.isInteger(bookId)) {
    return next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('favorites')
    .del('*')
    .where('book_id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Favorite not found');
      }

      delete book.id;

      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
