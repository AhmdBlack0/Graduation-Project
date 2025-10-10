import Book from "../models/book.model.js";
import Category from "../models/category.model.js";
import { v2 as cloudinary } from "cloudinary";

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

function isBase64Image(str) {
  return str && typeof str === "string" && str.startsWith("data:image");
}

// 🟢 إنشاء كتاب جديد
export const createBook = async (req, res) => {
  try {
    const { title, author, details, category, subCategory, content, bookImg } =
      req.body;

    if (!title || !author || !category || !subCategory || !content) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    let finalBookImg = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "books",
      });
      finalBookImg = result.secure_url;
    } else if (isBase64Image(bookImg)) {
      const result = await cloudinary.uploader.upload(bookImg, {
        folder: "books",
      });
      finalBookImg = result.secure_url;
    } else {
      const cat = await Category.findOne({ name: category });
      finalBookImg = cat?.image || "";
    }

    const newBook = new Book({
      title,
      author,
      details,
      category,
      subCategory,
      content: typeof content === "string" ? content : JSON.stringify(content),
      bookImg: finalBookImg,
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
    const totalBooks = await Book.countDocuments();

    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const parsedBooks = books.map((book) => ({
      ...book._doc,
      content: undefined,
    }));

    res.status(200).json({
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: parseInt(page),
      books: parsedBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 1 } = req.query;

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const parsedContent = safeParseJSON(book.content);

    if (parsedContent?.pages && Array.isArray(parsedContent.pages)) {
      const totalPages = parsedContent.pages.length;
      const start = (page - 1) * limit;
      const end = start + parseInt(limit);
      const pagedContent = parsedContent.pages.slice(start, end);

      return res.status(200).json({
        totalPages,
        currentPage: parseInt(page),
        pages:
          parseInt(limit) === 1 && pagedContent.length
            ? pagedContent[0]
            : pagedContent,
      });
    }

    res.status(200).json({ page_number: 1, content: parsedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, subCategory, details, bookImg } = req.body;

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (subCategory) book.subCategory = subCategory;
    if (details) book.details = details;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "books",
      });
      book.bookImg = result.secure_url;
    } else if (isBase64Image(bookImg)) {
      const result = await cloudinary.uploader.upload(bookImg, {
        folder: "books",
      });
      book.bookImg = result.secure_url;
    } else if (!bookImg && category) {
      const cat = await Category.findOne({ name: category });
      book.bookImg = cat?.image || "";
    }

    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { page_number, content } = req.body;

    if (!page_number || !content)
      return res
        .status(400)
        .json({ message: "page_number and content are required" });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const parsed = safeParseJSON(book.content);
    if (!parsed.pages || !Array.isArray(parsed.pages))
      return res.status(400).json({ message: "Invalid book content format" });

    const pageIndex = parsed.pages.findIndex(
      (p) => p.page_number === page_number
    );

    if (pageIndex === -1) parsed.pages.push({ page_number, content });
    else parsed.pages[pageIndex].content = content;

    book.content = JSON.stringify(parsed);
    const updatedBook = await book.save();

    res.status(200).json({
      ...updatedBook._doc,
      content: parsed,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoryImage = async (req, res) => {
  try {
    const { categoryName, image } = req.body;

    if (!categoryName || !image)
      return res
        .status(400)
        .json({ message: "categoryName and image are required" });

    let imageUrl = image;

    if (isBase64Image(image)) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "categories",
      });
      imageUrl = uploaded.secure_url;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { name: categoryName },
      { image: imageUrl },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Category image updated successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      imageUrl = uploaded.secure_url;
    }

    const category = new Category({
      name,
      subCategories: subCategories ? JSON.parse(subCategories) : [],
      image: imageUrl,
    });

    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const [books, categoriesFromDB] = await Promise.all([
      Book.find(),
      Category.find(),
    ]);

    const categoryImageMap = {};
    categoriesFromDB.forEach((cat) => {
      categoryImageMap[cat.name] = cat.image;
    });

    const categoriesMap = {};

    books.forEach((book) => {
      const category = book.category || "غير محدد";
      const subCategory = book.subCategory || "غير محدد";

      if (!categoriesMap[category]) {
        categoriesMap[category] = {
          name: category,
          image: categoryImageMap[category] || "",
          subCategories: new Set(),
        };
      }

      categoriesMap[category].subCategories.add(subCategory);
    });

    // نحول الـ Sets إلى Arrays
    const categories = Object.values(categoriesMap).map((cat) => ({
      ...cat,
      subCategories: [...cat.subCategories],
    }));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
