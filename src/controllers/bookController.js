const { isValidRequestBody } = require("../utils/validator");
const { filterschema, bookschema, objectIdschema, updateschema } = require("../utils/joiValidator");
const BookModel = require("../models/bookModel");
const UserModel = require("../models/userModel");
const ReviewModel = require("../models/reviewModel");
const createError = require("http-errors");

//-----------------------------------CREATING BOOK----------------------------------------------------//
const createBook = async function (req, res, next) {
  try {
    //Checking whether any input data is provided
    if (!isValidRequestBody(req.body))
      throw createError.BadRequest("Input data is not provided");

    //Checking for inputs in the query params
    if (isValidRequestBody(req.query))
      throw createError.NotAcceptable("Invalid request");

    //Validating Joi Schema
    const requestBody = await bookschema.validateAsync(req.body);

    //Destructuring the new request body
    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
      isDeleted,
      reviews,
      deletedAt,
    } = requestBody;

    //Checking if the user with userId exits
    const isUserExits = await UserModel.findById(userId);
    if (!isUserExits) throw createError.NotFound(`user does not exits`);

    //Checking if the title is unique
    const isTitleUnique = await BookModel.findOne({
      title: title,
      isDeleted: false,
      deletedAt: null,
    });
    if (isTitleUnique)
      throw createError.Conflict(`Book with this ${title} already exist`);

    //Checking if the ISBN is unique
    const isISBNUnique = await BookModel.findOne({
      ISBN: ISBN,
      isDeleted: false,
      deletedAt: null,
    });
    if (isISBNUnique) throw createError.Conflict(`${ISBN} already exist`);

    const bookData = {
      title: title,
      excerpt: excerpt,
      userId: userId,
      ISBN: ISBN,
      category: category,
      subcategory: subcategory,
      releasedAt: releasedAt,
      isDeleted: false,
      reviews: 0,
      deletedAt: null,
    };

    const newBook = await BookModel.create(bookData);

    return res.status(201).send({
      status: true,
      message: "new book registered successfully",
      data: newBook,
    });
  } catch (err) {
    //Filtering out joi error form the server error
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//-----------------------------------GET BOOK LIST----------------------------------------------------------//
const getBookList = async function (req, res, next) {
  try {
    const requestBody = req.body;
    const requestQuery = req.query;
    const filterCondition = { isDeleted: false, deletedAt: null };
    if (isValidRequestBody(requestBody))
      throw createError.BadRequest("No data is required in the body");

    if (isValidRequestBody(requestQuery)) {
      const result = await filterschema.validateAsync(requestQuery);
      const { userId, category, subcategory } = result;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw createError.NotFound(`User with ${userId} does not exits`);
      } else {
        filterCondition["userId"] = userId;
      }
      if(category) filterCondition["category"] = category;
      if(subcategory) filterCondition["subcategory"] = subcategory;
      console.log(filterCondition)
    
      const bookListAfterFiltration = await BookModel.find(filterCondition)
        .select({
          _id: 1,
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          subcategory: 1,
          releasedAt: 1,
          reviews: 1,
        })
        .sort({ title: 1 });

      if (bookListAfterFiltration.length == 0) throw createError.NotFound('No books found')

      res.status(200).send({
        status: true,
        message: "filtered Book list is here",
        booksCount: bookListAfterFiltration.length,
        bookList: bookListAfterFiltration,
      });

    } else {
      // if filters are not provided
      const bookList = await BookModel.find(filterCondition)
        .select({
          _id: 1,
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          subcategory: 1,
          releasedAt: 1,
          reviews: 1,
        })
        .sort({ title: 1 });

      if (bookList.length == 0) throw createError.NotFound('No books found')

      res.status(200).send({
        status: true,
        message: "Book list is here",
        booksCount: bookList.length,
        bookList: bookList,
      })
    }
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

//-----------------------------------GET BOOK DETAILS----------------------------------------------------//
const getBookDetails = async function (req, res, next) {
  try{
    //Setting the request data
    const requestBody = req.body;
    const requestQuery = req.query;
    const bookId = req.params.bookId;

    // Query params should be empty
    if (isValidRequestBody(requestQuery))
      throw createError.BadRequest("Invalid request as no data is required in query params");
 
    //Request body should not be empty
    if (isValidRequestBody(requestBody))
      throw createError.BadRequest("Invalid request as no data is required in request body");
 
    //Checking whether bookId is provided in path params 
    if (!bookId)
      throw createError.NotAcceptable("Book Id is not provided in params")
    
    //Validating the bookId
    const validBookId = await objectIdschema.validateAsync(bookId)

    // USING .lean() to convert mongoose object to plain js object for adding a property temporarily
    const bookFromId = await BookModel.findOne({
      _id: validBookId,
      isDeleted: false,
      deletedAt: null,
    }).lean();

    //Checking if the book exits in DB with the given bookId  
    if (!bookFromId) throw createError.NotFound(`No book exits with ${validBookId} or the book has been deleted`)

    //Getting all the reiews of the book
    const allReviewsOfThisBook = await ReviewModel.find({
      bookId: validBookId,
      isDeleted: false,
    })

    //Adding a temporary new property inside book model and assigning it to allReviews array
    bookFromId.reviewsData = allReviewsOfThisBook

    return res.status(200).send({status: true, mssg: "complete book details are:", data: bookFromId})

  }
  catch(err){
    if(err.isJoi == true) err.status = 422
    next(err)
  }
}

//-----------------------------------UPDATE BOOK DETAILS----------------------------------------------------//
const updateBook = async function (req, res, next) {
  try{
    //Setting the request data
    const requestBody = req.body;
    const requestQuery = req.query;
    const bookId = req.params.bookId;

    // Query params should be empty
    if (isValidRequestBody(requestQuery))
      throw createError.BadRequest("Invalid request as no data is required in query params");
 
    //Request body should not be empty
    if (!isValidRequestBody(requestBody))
      throw createError.NotAcceptable("No data is provided in the request body");
 
    //Checking whether bookId is provided in path params 
    if (!bookId)
      throw createError.NotAcceptable("Book Id is not provided in params")
    
    //Validating the bookId
    const validBookId = await objectIdschema.validateAsync(bookId)

    const validRequestBody = await updateschema.validateAsync(requestBody)

    //Destructuring the new request body
    const { title, excerpt, ISBN, releasedAt } = validRequestBody;
    //Checking if the title is unique
    const isTitleUnique = await BookModel.findOne({
      title: title,
      isDeleted: false,
      deletedAt: null,
    });
    if (isTitleUnique)
      throw createError.Conflict(`Book with this ${title} already exist`);

    //Checking if the ISBN is unique
    const isISBNUnique = await BookModel.findOne({
      ISBN: ISBN,
      isDeleted: false,
      deletedAt: null,
    });
    if (isISBNUnique) throw createError.Conflict(`${ISBN} already exist`);

    const updatedBook = await BookModel.findByIdAndUpdate({_id: validBookId, isDeleted: false, deletedAt: null},{$set: validRequestBody}, {new:true})
    //Checking if the book exits in DB with the given bookId  
    if (!updatedBook) throw createError.NotFound(`No book exits with ${validBookId} or the book has been deleted`)

    return res.status(200).send({status: true, mssg: "Book details have been updateded", data: updatedBook})
  }
  catch(err){
    if(err.isJoi == true) err.status = 422
    next(err)
  }
}

//-----------------------------------DELETE BOOK DETAILS----------------------------------------------------//
const deleteBook = async function (req, res, next) {
  try{
    //Setting the request data
    const requestBody = req.body;
    const requestQuery = req.query;
    const bookId = req.params.bookId;

    // Query params should be empty
    if (isValidRequestBody(requestQuery))
      throw createError.BadRequest("Invalid request as no data is required in query params");
 
    //Request body should not be empty
    if (isValidRequestBody(requestBody))
      throw createError.BadRequest("Invalid request as no data is required in request body");
 
    //Checking whether bookId is provided in path params 
    if (!bookId)
      throw createError.NotAcceptable("Book Id is not provided in params")
    
    //Validating the bookId
    const validBookId = await objectIdschema.validateAsync(bookId)

    const bookDelete = await BookModel.findByIdAndUpdate({_id: validBookId, isDeleted: false, deletedAt: null}, {$set: {isDeleted: true, deletedAt: Date.now()}}, {new: true})
  
    //Checking if the book exits in DB with the given bookId  
    if (!bookDelete) throw createError.NotFound(`No book exits with ${validBookId} or the book has been deleted`)

    return res.status(200).send({sattus: true, mssg: "The book has been marked deleted"})
  }
  catch(err){
    if(err.isJoi == true) err.status = 422
    next(err)
  }
}

module.exports = { createBook, getBookList, getBookDetails, updateBook, deleteBook };
