import Book from "../models/book.model.js";

export const createBook = async (req, res) => {
  try {
    const { title, author, details, category, subCategory, content } = req.body;
    if (!title || !author || !category || !subCategory || !content) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }
    const newBook = new Book({
      title,
      author,
      details,
      category,
      subCategory,
      content,
    });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
