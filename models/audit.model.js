import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
    document:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action:{
        type: String,
        enum: ['created', 'viewed', 'signed', 'rejected', 'sent', 'downloaded'],
        required: true,
    },
    ipAddress: {
        type: String,
    },
    userAgent:{
        type: String,
    },
    metadata:{
        type: Object,
        default: {},
    }
},{timestamps: true})

export default mongoose.model('Audit', auditSchema)