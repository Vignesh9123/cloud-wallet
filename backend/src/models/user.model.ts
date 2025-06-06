import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    privateKey:{
        type: String
    },
    publicKey:{
        type: String
    }
    
}, {timestamps: true})

export const User = model("User", userSchema)