import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    title:{
        type:String,
        required: [true, 'Document title is required'],
        trim:true,
    },
    originalName: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    mimeType:{
        type:String,
        required: true,

    },
    uploadedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status:{
        type:String,
        enum: ['draft', 'pending', 'completed', 'rejected'],
        default: 'draft',
    },

    signers:[{
        email: String,
        name: String,
        status: {
            type: String,
            enum: ['pending', 'signed', 'rejected'],
            default: 'pending'
        }
    }],

    signedFilePath:{
        type: String,
        default: null,
    }

},{timestamps: true})

export default mongoose.model('Document', documentSchema);