const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const BookModel = require("../models/bookModel");
const { objectIdschema } = require("../utils/joiValidator")

const authentication = async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) throw createError.NotFound("Token not found");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    if (Date.now() > decodedToken.exp * 1000)
      throw createError.RequestTimeout(" session expired please login again");
    req.decodedToken = decodedToken;
    next();
  } catch (err) {
    if (err.isjwt == true) err.status(401);
    next(err);
    // return res.status(401).send({ message: "authentication has failed" });
  }
};

const authorizationByUserID = async (req, res, next) => {
  try {
    const decodedToken = req.decodedToken;
    const userId = req.body.userId;

    if (decodedToken.userId !== userId)
      throw createError.Forbidden("Unauthorized access");
    next();
  } catch (err) {
    next(err);
  }
};

const authorizationByBookID = async (req, res, next) => {
  try {
    const decodedToken = req.decodedToken;
    const bookId = req.params.bookId;

    //Checking whether bookId is provided in path params 
    if (!bookId)
      throw createError.NotAcceptable("Book Id is not provided in params")
    
    //Validating the bookId
    const validBookId = await objectIdschema.validateAsync(bookId)

    const book = await BookModel.findOne({_id: validBookId, isDeleted: false, deletedAt: null})
    //Checking if the book exits in DB with the given bookId  
    if (!book) throw createError.NotFound(`No book exits with ${validBookId} or the book has been deleted`)

    console.log(book.userId.toString())
    console.log(decodedToken.userId)
    if (decodedToken.userId !== book.userId.toString())
      throw createError.Forbidden("Unauthorized access");
    next();
  } catch (err) {
    if(err.isJoi == true) err.status = 422
    next(err);
  }
};

module.exports = { authentication, authorizationByUserID, authorizationByBookID };
