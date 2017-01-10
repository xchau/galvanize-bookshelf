'use strict';

const express = require('express');
const boom = require('boom');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', (req, res, next) => {
  knex('books')
    .orderBy('title')
    .then((books) => {
      res.send(camelizeKeys(books));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body;

  if (!title || !title.trim()) {
    return next(boom.create(400, 'Title must not be blank')); // ? not throw
  }
  if (!author || !author.trim()) {
    return next(boom.create(400, 'Author must not be blank'));
  }
  if (!genre || !genre.trim()) {
    return next(boom.create(400, 'Genre must not be blank'));
  }
  if (!description || !description.trim()) {
    return next(boom.create(400, 'Description must not be blank'));
  }
  if (!coverUrl || !coverUrl.trim()) {
    return next(boom.create(400, 'Cover URL must not be blank'));
  }

  const validBook = { title, author, genre, description, coverUrl };

  knex('books')
    .insert(validBook, '*')
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id) || id < 0) {
    return next();
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        const err = new Error('Book id does not exist');

        err.status = 400;

        throw err;
      }

      const { title, author, genre, description, coverUrl } = req.body;
      const updateBook = {};

      if (title) {
        updateBook.title = title;
      }
      if (author) {
        updateBook.author = author;
      }
      if (genre) {
        updateBook.genre = genre;
      }
      if (description) {
        updateBook.description = description;
      }
      if (coverUrl) {
        updateBook.coverUrl = coverUrl;
      }

      return knex('books')
        .update(updateBook, '*')
        .where('id', req.params.id);
    })
    .then((books) => {
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('books')
    .del('*')
    .where('id', id)
    .then((row) => {
      if (!row.length) {
        return next();
      }

      const book = row[0];

      delete book.id;
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
