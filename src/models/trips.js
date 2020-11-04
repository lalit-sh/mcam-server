import mongoose, { Schema } from "mongoose";


const schema = new Schema({
    name: {
        type: String,
        required: [true, "Trip name is required"]
    },
    username: {
        type: String,
        required: [true, "Username required"]
    },
    members: [String],
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

schema.index({ name: 1, username: 1 }, { unique: true });

const model = mongoose.model("Trips", schema);
export default model;