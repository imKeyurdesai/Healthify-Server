import express from "express";
import { doctorAuth } from "../middlewares/auth.js";
import Post from "../models/post.js";

const feedRouter = express.Router()

feedRouter.post('/feed/post/upload', doctorAuth, async (req,res) => {
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

feedRouter.get('/feed', async (req,res) => {
    try {
        const posts = await Post.find().populate('authorId',)
        res.status(200).json({ posts })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

feedRouter.delete('/feed/post/delete', doctorAuth, async (req,res) => {
    try {
        const { id } = req.body
        const post = await Post.findByIdAndDelete(id)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        res.status(200).json({ message: "Post deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

feedRouter.put('/feed/post/update', doctorAuth, async (req,res) => {
    try {
        const { id, title, content, imageUrl } = req.body

        const post = await Post.findByIdAndUpdate(id, { title, content, imageUrl }, { new: true })
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        res.status(200).json({ message: "Post updated successfully", post })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

feedRouter.patch('/feed/post/like', async (req,res) => {
    try {
        const { id } = req.body
        const post = await Post.findById(id)
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        post.likes = (post.likes || 0) + 1
        await post.save()
        res.status(200).json({ message: "Post liked successfully", post })
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

feedRouter.patch('/feed/post/unlike', async (req,res) => {
    try {
        const { id } = req.body
        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        post.likes = Math.max(0, (post.likes || 0) - 1)
        await post.save()
        res.status(200).json({ message: "Post unliked successfully", post })
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
})

export default feedRouter