const Joi = require("joi");

const userschema = Joi.object({
  title: Joi.string().required().valid("Mr", "Mrs", "Miss"),
  name: Joi.string().required().min(3),
  phone: Joi.string()
    .required()
    .pattern(new RegExp(/^[6-9]\d{9}$/)),
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,15}$/))
    .required(),
  address: Joi.object().keys({
    street: Joi.string(),
    city: Joi.string(),
    pincode: Joi.string(),
  }),
});

const loginschema = Joi.object({
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,15}$/))
    .required(),
});

const bookschema = Joi.object({
  title: Joi.string().required().trim(),
  excerpt: Joi.string().required().min(3).trim(),
  userId: Joi.string().hex().length(24).required(),
  ISBN: Joi.string()
    .pattern(new RegExp(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/))
    .required()
    .trim(),
  category: Joi.string().min(3).required().trim(),
  subcategory: Joi.array().items(Joi.string().min(3).required().trim()),
  reviews: Joi.number().default(0),
  deletedAt: Joi.date().timestamp(),
  isDeleted: Joi.boolean().default(false),
  releasedAt: Joi.date().max("2022-01-01").required(),
});

const updateschema = Joi.object({
  title: Joi.string().required().trim(),
  excerpt: Joi.string().required().min(3).trim(),
  ISBN: Joi.string()
    .pattern(new RegExp(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/))
    .required()
    .trim(),
  releasedAt: Joi.date().max("2022-01-01").required(),
})

const filterschema = Joi.object({
  userId: Joi.string().hex().length(24),
  category: Joi.string().min(3).trim(),
  subcategory: Joi.string().min(3).trim()
});

const objectIdschema = Joi.string().hex().length(24).required()

const reviewschema = Joi.object({
  reviewedBy: Joi.string().min(3).default('Guest').trim(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().min(5).trim()
})

module.exports = { userschema, loginschema, bookschema, filterschema, objectIdschema, reviewschema, updateschema };
