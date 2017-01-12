'use strict';

const Joi = require('joi');

module.exports.post = {
  body: {
    email: Joi.string()
      .label('Email')
<<<<<<< HEAD
      .email()
      .required()
      .trim()
      .max(30),

    password: Joi.string()
      .label('password')
      .required()
      .trim()
      .min(8)
=======
      .required()
      .email()
      .trim(),

    password: Joi.string()
      .label('Password')
      .required()
      .min(8)
      .trim()
>>>>>>> boom-only
  }
};
