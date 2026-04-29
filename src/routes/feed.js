import express from "express";
import { doctorAuth } from "../middlewares/auth.js";
import Post from "../models/post.js";

const feedRouter = express.Router()

feedRouter.post('/feed/upload', doctorAuth, async (req,res) => {
    try {
        const doctor = req.doctor
        const { title, content, imageUrl } = req.body

        if (!title || !content) {
            throw new Error('title and content are required')
        }
        const post = new Post({
            title,
            content,
            imageUrl,
            authorId: doctor._id
        })

        await post.save()

        res.status(201).json({ message: "Post created successfully", post })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

export default feedRouter