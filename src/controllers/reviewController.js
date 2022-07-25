const { isValidRequestBody } = require("../utils/validator");
const { objectIdschema, reviewschema } = require("../utils/joiValidator");
const BookModel = require("../models/bookModel");
const ReviewModel = require("../models/reviewModel");
const createError = require("http-errors");

//----------------------------------------NEW REVIEW----------------------------------------------------//
const newReview = async function (req, res, next) {
  try {
    //Setting the request data
    const requestBody = req.body;
    const requestQuery = req.query;
    const bookId = req.params.bookId;
    
    //Validating the query params
    if (isValidRequestBody(requestQuery))
    throw createError.BadRequest("Invalid request");
    
    //Validating the request body
    if (!isValidRequestBody(requestBody))
    throw createError.NotAcceptable("Input data is not provided");
    
    //Checking whether bookId is providede in path params  
    if (!bookId)
    throw createError.NotAcceptable("Book Id is not provided in params");
    
    //Validating the bookId
    const validateBookId = await objectIdschema.validateAsync(bookId);

    //Getting book with the given bookId
    const bookFromId = await BookModel.findOne({
      _id: validateBookId,
      isDeleted: false,
      deletedAt: null,
    });

    //Checking if the book exits in DB with the given bookId
    if (!bookFromId) throw createError.NotFound(`No book exits with ${Id}`);
    
    //Validating the request body using Joi
    const validateRequestBody = await reviewschema.validateAsync(requestBody);
    
    //Destructuring the request body after validation using Joi
    const { reviewedBy, rating, review } = validateRequestBody;

    const reviewData = {
      bookId: validateBookId,
      reviewedBy: reviewedBy,
      reviewedAt: Date.now(),
      rating: rating,
      review: review,
      isDeleted: false,
    };
    
    //Creating the new Review
    const createReview = await ReviewModel.create(reviewData);
    
    //updating the review count in the bookmodel
    const updatedReviewCountInBook = await BookModel.findOneAndUpdate(
      { _id: validateBookId, isDeleted: false, deletedAt: null },{ $inc: {reviews: +1}},{ new: true });
      
    //Getting all the review of this book
    const allReviewsOfThisBook = await ReviewModel.find({
      bookId: validateBookId,
      isDeleted: false,
    });
      
    // USING .lean() to convert mongoose object to plain js object for adding a property temporarily
    const book = await BookModel.findOne({
      _id: validateBookId,
      isDeleted: false,
      deletedAt: null,
    }).lean();
      
    // temporarily adding one new property inside book which consist all reviews of this book
    book.reviewsData = allReviewsOfThisBook;
      
    return res.status(200).send({
      status: true,
      mssg: "New review has been added",
      data: book,
    });
  } 
  catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};
  
//----------------------------------------UPDATE REVIEW----------------------------------------------------//
const updateReview = async function (req, res, next) {
  try {
    //Setting the request data
    const requestBody = req.body;
    const requestQuery = req.query;
    const bookId = req.params.bookId;
    const reviewId = req.params.reviewId;
  
    // Query params should be empty
    if (isValidRequestBody(requestQuery))
      throw createError.BadRequest("Invalid request");
  
    //Request body should not be empty
    if (!isValidRequestBody(requestBody))
      throw createError.NotAcceptable("Input data is not provided");
  
      //Checking whether bookId is provided in path params 
      if (!bookId)
      throw createError.NotAcceptable("Book Id is not provided in params")
  
    //Checking whether reviewId is provided in path params
    if (!reviewId)
      throw createError.NotAcceptable("Review Id is not provided in params")
  
      //Validating the bookId
      const validateBookId = await objectIdschema.validateAsync(bookId);
      
      // USING .lean() to convert mongoose object to plain js object for adding a property temporarily
      const bookFromId = await BookModel.findOne({
        _id: validateBookId,
        isDeleted: false,
        deletedAt: null,
      }).lean();
  
      //Checking if the book exits in DB with the given bookId  
      if (!bookFromId) throw createError.NotFound(`No book exits with ${validateBookId} or the book has been deleted`)
      
      //Validating the reviewId
      const validateReviewId = await objectIdschema.validateAsync(reviewId);
      
      //Checking if the review exits in DB with the given reviewId
      const reviewFromId = await ReviewModel.findOne({
        _id: validateReviewId,
        isDeleted: false
      });
      if (!reviewFromId) throw createError.NotFound(`No review exits with ${validateReviewId} or the review has been deleted`)
      
    //Comparing bookId from review to the bookId from query params
   if(reviewFromId.bookId.toString() !== validateBookId) throw createError.Conflict('This review is not of the bookId given in params')

    //Validating the request body by Joi schema
    const validateRequestBody = await reviewschema.validateAsync(requestBody);

    //Destructuring the request body after validation using Joi
   const { reviewedBy, rating, review } = validateRequestBody

    const update = {
      reviewedBy: reviewedBy,
      rating: rating,
      review: review
    }
    
    //Updating the review
    const reviewUpdate = await ReviewModel.findByIdAndUpdate({_id: validateReviewId, isDeleted: false}, {$set: update}, {new: true})
    
    const allReviewsOfThisBook = await ReviewModel.find({
      bookId: validateBookId,
      isDeleted: false,
    })
    
    bookFromId.reviewsData = allReviewsOfThisBook
    
    return res.status(200).send({status: true, mssg: "Review has been updated", data: bookFromId })
  } 
  catch (err) {
    if(err.isJoi == true) err.status = 422
    next(err);
  }
};

//----------------------------------------DELETE REVIEW----------------------------------------------------//
const deleteReview = async function (req, res, next) {
  try{
     //Setting the request data
     const requestBody = req.body;
     const requestQuery = req.query;
     const bookId = req.params.bookId;
     const reviewId = req.params.reviewId;
   
   // Query params should be empty
   if (isValidRequestBody(requestQuery))
     throw createError.BadRequest("Invalid request as no data is required in query params");
   
   //Request body should not be empty
   if (isValidRequestBody(requestBody))
     throw createError.BadRequest("Invalid request as no data is required in request body");
   
   //Checking whether bookId is provided in path params 
   if (!bookId)
     throw createError.NotAcceptable("Book Id is not provided in params")
   
   //Checking whether reviewId is provided in path params
   if (!reviewId)
     throw createError.NotAcceptable("Review Id is not provided in params")
   
   //Validating the bookId
   const validateBookId = await objectIdschema.validateAsync(bookId)

   const bookFromId = await BookModel.findOne({
      _id: validateBookId,
      isDeleted: false,
      deletedAt: null,
    });

    //Checking if the book exits in DB with the given bookId  
    if (!bookFromId) throw createError.NotFound(`No book exits with ${validateBookId} or the book has been deleted`)

    //Validating the reviewId
    const validateReviewId = await objectIdschema.validateAsync(reviewId);

    //Checking if the review exits in DB with the given reviewId
    const reviewFromId = await ReviewModel.findOne({
      _id: validateReviewId,
      isDeleted: false
    });
    if (!reviewFromId) throw createError.NotFound(`No review exits with ${validateReviewId} or the review has been deleted`)

    //Comparing bookId from review to the bookId from query params
    if(reviewFromId.bookId.toString() !== validateBookId) throw createError.Conflict('This review is not of the bookId given in params')

    //Setting the isDeleted status
    const markReview = await ReviewModel.findByIdAndUpdate({_id:validateReviewId}, {$set: {isDeleted: true}}, {new: true})

    //updating the review count in the bookmodel
    const updatedReviewCountInBook = await BookModel.findOneAndUpdate({ _id: validateBookId, isDeleted: false, deletedAt: null },{ $inc: {reviews: -1}},{ new: true })

    return res.status(200).send({satus: true, mssg: "Review has been deleted" })
  }
  catch(err){
    if(err.isJoi == true) err.status = 422
    next(err)
  }
}



module.exports = { newReview, updateReview, deleteReview };
