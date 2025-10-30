import Document from "../models/Document.js";
import cloudinary from "../config/cloudinary.js";

export const uploadDocument = async (req, res) => {
  try {
    const { base64File, filename, title, content, category } = req.body;

    const uploadedResponse = await cloudinary.uploader.upload(base64File, {
      folder: "reports",
      resource_type: "auto",
      public_id: filename,
      use_filename: true,
      unique_filename: false,
      access_mode: "public",
    });

    console.log("Cloudinary response:", uploadedResponse);

    const fileUrl = uploadedResponse.secure_url || uploadedResponse.url;

    const document = new Document({
      title,
      content,
      category,
      fileUrl,
    });

    await document.save();

    res
      .status(201)
      .json({ message: "Document uploaded successfully", data: document });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json({ data: documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json({ data: document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json({ message: "Document updated", data: document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
