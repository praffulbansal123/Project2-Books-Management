const express = require('express')
const router = express.Router()
const UserController =  require('../controllers/userController')
const BookController =  require('../controllers/bookController')
const ReviewController = require('../controllers/reviewController')
const Middleware = require('../middleware/auth')

//------------------------------------------USER ROUTES------------------------------------------------------//
router.post('/createUser', UserController.createUser)

router.post('/userLogin', UserController.userLogin)

//------------------------------------------BOOK ROUTES------------------------------------------------------//
router.post('/createBook', Middleware.authentication, Middleware.authorizationByUserID, BookController.createBook)

router.get('/getBookList', Middleware.authentication, BookController.getBookList)

router.get('/books/:bookId', Middleware.authentication, BookController.getBookDetails)

router.put('/books/:bookId', Middleware.authentication, Middleware.authorizationByBookID, BookController.updateBook)

router.delete('/books/:bookId', Middleware.authentication, Middleware.authorizationByBookID, BookController.deleteBook)

//------------------------------------------REVIEW ROUTES----------------------------------------------------//
router.post('/books/:bookId/review', ReviewController.newReview)

router.put('/books/:bookId/review/:reviewId', ReviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId', ReviewController.deleteReview)

module.exports = router