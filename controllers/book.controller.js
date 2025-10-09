import Book from "../models/book.model.js";

// دالة آمنة لتحويل JSON string إلى Object
function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// ✅ 1️⃣ إنشاء كتاب جديد
export const createBook = async (req, res) => {
  try {
    const { title, author, details, category, subCategory, content } = req.body;

    if (!title || !author || !category || !subCategory || !content) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

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

// ✅ 2️⃣ Pagination للكتب
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const totalBooks = await Book.countDocuments();
    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const parsedBooks = books.map((book) => ({
      ...book._doc,
      content: undefined, // لا نرسل المحتوى هنا
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

// ✅ 3️⃣ جلب كتاب واحد (مع Pagination للصفحات + content JSON)
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 1 } = req.query;

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const parsedContent = safeParseJSON(book.content);

    // لو المحتوى عبارة عن صفحات
    if (
      parsedContent &&
      parsedContent.pages &&
      Array.isArray(parsedContent.pages)
    ) {
      const totalPages = parsedContent.pages.length;
      const start = (page - 1) * limit;
      const end = start + parseInt(limit);
      const pagedContent = parsedContent.pages.slice(start, end);

      return res.status(200).json({
        ...book._doc,
        content: parsedContent, // ✅ هنا رجعنا المحتوى كـ JSON كامل
        totalPages,
        currentPage: parseInt(page),
        pages: pagedContent,
      });
    }

    // لو المحتوى مش صفحات
    res.status(200).json({
      ...book._doc,
      content: parsedContent, // ✅ هنا كمان JSON
      totalPages: 1,
      currentPage: 1,
      pages: [{ page_number: 1, content: parsedContent }],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 4️⃣ تحديث صفحة محددة داخل الكتاب
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
    if (pageIndex === -1) {
      parsed.pages.push({ page_number, content });
    } else {
      parsed.pages[pageIndex].content = content;
    }

    book.content = JSON.stringify(parsed);
    const updatedBook = await book.save();

    res.status(200).json({
      ...updatedBook._doc,
      content: parsed, // ✅ نرجع المحتوى بصيغة JSON
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ 5️⃣ حذف كتاب
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
