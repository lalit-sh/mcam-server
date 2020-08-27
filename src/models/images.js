import mongoose, { Schema } from "mongoose";


const schema = new Schema({
    username: {
        type: String,
        required: [true, "user name is required"]
    },
    tripname: {
        type: String,
        required: [true, "tripname required"]
    },
    imageKey: {
        type: String,
    },
    imageUrl: {
        type: String,
        unique: [true, "Image url should be unique"]
    },
    members: [Object],
    isDeleted: {
        type: Boolean,
        unique: [true, "Only one trip can stay active at one time"],
        default: false
    }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const Images = mongoose.model("images", schema);

schema.pre("save", function (next) {

    this.members = this.members.map(el => {
        if(typeof el === 'string'){
            return {
                "name": el,
                "isDelivered": false
            }
        }
        return el;
    });
    next();
});


export const newImage = async ({username, tripname, imageKey, imageUrl, members}) => {
    try{
        let d = {
            username: username,
            tripname: tripname,
            imageKey: imageKey,
            imageUrl: imageUrl,
            members: members
        };
        const image = new Images(d);
        const result = await image.save();
        return result;

    }catch(error){
        return error;
    }
}

export const updateDownloadStatus = (username, tripname, imageurl, membername) => {

}


export default Images;