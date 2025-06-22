import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["drawn", "typed", "uploaded"],
      required: true,
    },
    content: {
      // For drawn: data URL of signature
      // For typed: the text content
      // For uploaded: path to uploaded signature image

      type: String,
      required: true,
    },
    position: {
      page: {
        type: Number,
        required: true,
      },
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },
    signedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Signature", signatureSchema);
