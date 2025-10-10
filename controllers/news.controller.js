import { News } from "../models/news.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createOneNews = async (req, res) => {
  try {
    const { title, content, img } = req.body;
    if (!title || !content || !img) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const uploadedImage = await cloudinary.uploader.upload(img, {
      folder: "news",
    });
    const newNews = new News({
      title,
      content,
      img: uploadedImage.secure_url,
    });
    await newNews.save();
    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, img } = req.body;
    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }
    if (img && img !== newsItem.img) {
      const uploadedImage = await cloudinary.uploader.upload(img, {
        folder: "news",
      });
      newsItem.img = uploadedImage.secure_url;
    }
    newsItem.title = title || newsItem.title;
    newsItem.content = content || newsItem.content;
    await newsItem.save();
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findByIdAndDelete(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }
    res.status(200).json({ message: "News item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
