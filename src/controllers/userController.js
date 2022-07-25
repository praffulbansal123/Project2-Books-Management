const { isValidRequestBody } = require("../utils/validator");
const { userschema, loginschema, bookschema } = require("../utils/joiValidator")
const UserModel = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const bcrypt = require('bcrypt')

//----------------------------------------CREATING USER------------------------------------------------------//
const createUser = async function (req, res, next) {
  try {
    //Checking whether any input data is provided
    if (!isValidRequestBody(req.body))
      throw createError.BadRequest("Input data is not provided");
      
    //Checking for inputs in the query params
    if (isValidRequestBody(req.query))
      throw createError.NotAcceptable("Invalid request");
      
    //Validating Joi Schema
    const requestBody = await userschema.validateAsync(req.body);
    
    //Destructuring the new request body
    const { title, name, phone, email, password, address } = requestBody;
    
    //Checking if the phone number is unique
    const isPhoneUnique = await UserModel.findOne({ phone: phone });
    if (isPhoneUnique)
      throw createError.Conflict(`mobile number: ${phone} already exist`);
    
    //Checking if the email is unique
    const isEmailUnique = await UserModel.findOne({ email: email });
    if (isEmailUnique)
      throw createError.Conflict(`Email Id: ${email} already exist`);

    const userData = {
      title: title.trim(),
      name: name.trim(),
      phone: phone,
      email: email.trim(),
      password: password,
      address: address,
    };

    const newUser = await UserModel.create(userData);

    // mask the password
    newUser.password = undefined;
    
    return res.status(201).send({
      status: true,
      message: "new user registered successfully",
      data: newUser,
    });
  } catch (err) {
    //Filtering out joi error form the server error
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//----------------------------------------USER LOGIN-------------------------------------------------------//
const userLogin = async function (req, res, next) {
  try {
    //Checking whether any input data is provided
    if (!isValidRequestBody(req.body))
      throw createError.BadRequest("Input data is not provided");
      
      //Checking for inputs in the query params
      if (isValidRequestBody(req.query))
      throw createError.NotAcceptable("Invalid request");
      
      //Validating Joi Schema
      const requestBody = await loginschema.validateAsync(req.body);
      
      //Destructuring the new request body
      const { email, password } = requestBody;
      console.log(requestBody);
      
      //Checking the credentials
      const loginuser = await UserModel.findOne({
        email: email,
    });

    // Comparing the hashed password
    const result = await bcrypt.compare(password, loginuser.password)
    if(!loginuser || !result)
      throw createError.Forbidden("Invalid login credentials");

    // Setting the Token data
    const userId = loginuser._id.toString();
    const payload = { userId: userId };
    const secretkey = process.env.JWT_SECRET;

    // creating the token
    const token = jwt.sign(payload, secretkey, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    res.setHeader("Authorization", "Bearer " + token);
    return res
      .status(200)
      .send({ status: true, mssg: "Login Sucessful", data: token });
  } catch (err) {
    //Filtering out joi error form the server error
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

module.exports = { createUser, userLogin };
