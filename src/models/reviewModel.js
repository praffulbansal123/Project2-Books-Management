const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: ObjectId,
      required: [true, "bookId must be provided"],
      ref: "Book",
      trim: true,
    },
    reviewedBy: {
      type: String,
      default: "Guest",
      trim: true,
    },
    reviewedAt: {
      type: Date,
      required: [true, "Review Date must be provided"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Book rating must be provided"],
      trim: true,
    },
    review: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema)