import mongoose, { Schema } from "mongoose";


const schema = new Schema({
    name: {
        type: String,
        unique: [true, "Another trip with same name already exsit"],
        required: [true, "Trip name is required"]
    },
    username: {
        type: String,
        required: [true, "Username required"]
    },
    members: [String],
    isActive: {
        type: Boolean,
        unique: [true, "Only one trip can stay active at one time"],
        default: false
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const model = mongoose.model("Trips", schema);
export default model;