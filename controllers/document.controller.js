import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Document from "../models/document.model.js";
import Audit from "../models/audit.model.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const { title } = req.body;

    const document = await Document.create({
      title: title || req.file.originalname.split(".")[0],
      originalname: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id, // assuming req.user is the authenticated user
    });

    // create audit log

    await Audit.create({
      document: document._id,
      user: req.user._id,
      action: "created",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading document" });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user documents" });
  }
};

export const getDocumentsById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isSigner = document.signers.some(
      (signer) => signer.email === req.user.email
    );

    if (!isOwner && !isSigner) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this document" });
    }

    // Create audit log for viewing

    await Audit.create({
      document: document._id,
      user: req.user._id,
      action: "viewed",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting Document By ID" });
  }
};

export const sendDocumentForSigning = async (req, res) => {
  try {
    const { signers } = req.body;

    if (!signers || !Array.isArray(signers) || signers.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one signer is required" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // If user owns the document or not

    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to send this document for signing" });
    }

    // Update document with signers and status

    document.signers = signers.map((signer) => ({
      email: signer.email,
      name: signer.name,
      status: "pending",
    }));
    document.status = "pending";
    await document.save();

    //send email to signers
    await Promise.all(
      signers.map((signer) =>
        sendSignatureRequest({
          to: signer.email,
          name: signer.name,
          documentId: document._id,
          documentTitle: document.title,
          senderName: req.user.name,
        })
      )
    );

    // Create audit log

    await Audit.create({
      document: document._id,
      user: req.user._id,
      action: "sent",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { recipients: signers.map((s) => s.email) },
    });

    res.json({ message: "Document sent for signing", document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending document" });
  }
};

export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if(!document){
            return res.status(404).json({ message: "Document not found" });
        }

        // Check if user owns the document

        if(document.uploadedBy.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "You do not have permission to delete this document" });
        }

        //Delete file from storage

        if(fs.existsSync(document.filePath)){
            fs.unlinkSync(document.filePath);
        }

        // Delete Signed file if exist
        if(document.signedFilePath &&  fs.existsSync(document.signedFilePath)){
            fs.unlinkSync(document.signedFilePath);
        }

        // Delete document from database
        await Document.findByIdAndDelete(req.params.id),

        Promise.all([
            Audit.deleteMany({document: req.params.id}),
        ])

        res.json({message: 'Document deleted successfully'});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Error deleting document" });
    }
}