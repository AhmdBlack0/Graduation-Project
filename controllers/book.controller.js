import Book from "../models/book.model.js";

// ✅ لتحويل النص إلى JSON بأمان
function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// ✅ إنشاء كتاب جديد
export const createBook = async (req, res) => {
  try {
    const { title, author, details, category, subCategory, content } = req.body;

    if (!title || !author || !category || !subCategory || !content) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    // 🔹 لو المحتوى مش string نحوله إلى JSON string
    const contentString =
      typeof content === "string" ? content : JSON.stringify(content);

    const newBook = new Book({
      title,
      author,
      details,
      category,
      subCategory,
      content: contentString,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ جلب كل الكتب (مع pagination)
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const totalBooks = await Book.countDocuments();
    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const parsedBooks = books.map((book) => ({
      ...book._doc,
      content: safeParseJSON(book.content),
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

// ✅ جلب كتاب واحد (مع دعم page داخل المحتوى)
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const parsedContent = safeParseJSON(book.content);

    // 🔹 لو الكتاب فيه صفحات داخلية
    if (Array.isArray(parsedContent) && page) {
      const pageNumber = parseInt(page);
      const pageContent = parsedContent.find((p) => p.page === pageNumber);
      if (!pageContent)
        return res.status(404).json({ message: "Page not found" });

      return res.status(200).json({
        ...book._doc,
        totalPages: parsedContent.length,
        currentPage: pageNumber,
        content: pageContent,
      });
    }

    // 🔹 لو الكتاب بدون صفحات
    res.status(200).json({
      ...book._doc,
      content: parsedContent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ تحديث المحتوى (صفحة معينة أو كامل)
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, page } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let parsedContent = safeParseJSON(book.content);
    if (!Array.isArray(parsedContent)) parsedContent = [];

    if (page) {
      const pageNumber = parseInt(page);
      const existingPage = parsedContent.find((p) => p.page === pageNumber);

      if (existingPage) {
        existingPage.text = content;
      } else {
        parsedContent.push({ page: pageNumber, text: content });
      }
    } else {
      parsedContent = content;
    }

    book.content = JSON.stringify(parsedContent);
    const updatedBook = await book.save();

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ حذف كتاب
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
