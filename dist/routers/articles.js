"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadService_1 = require("../services/uploadService");
const models_1 = require("../models");
const router = (0, express_1.Router)();
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME;
if (!MINIO_BUCKET_NAME) {
    throw new Error("MINIO_BUCKET_NAME is not defined in environment variables");
}
// --- CREATE ARTICLE ---
router.post("/", uploadService_1.upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), async (req, res) => {
    const { title, content, tags, categories } = req.body;
    // Type assertion for req.files to ensure TypeScript knows its structure
    const files = req.files;
    // Check req.files for the uploaded files
    const videoFile = files?.video?.[0]; // Get the first video file if present
    const thumbnailFile = files?.thumbnail?.[0]; // Get the first thumbnail file if present
    let videoUrl = undefined;
    let imageUrl = undefined;
    try {
        // Handle video upload if present
        if (videoFile) {
            videoUrl = await (0, uploadService_1.uploadFileToS3)(videoFile.buffer, videoFile.originalname, videoFile.mimetype, MINIO_BUCKET_NAME);
        }
        // Handle thumbnail image upload if present
        if (thumbnailFile) {
            // You might want to constrain image types here if necessary
            if (!thumbnailFile.mimetype.startsWith("image/")) {
                res
                    .status(400)
                    .json({ error: "Uploaded thumbnail is not an image." });
                return;
            }
            imageUrl = await (0, uploadService_1.uploadFileToS3)(thumbnailFile.buffer, thumbnailFile.originalname, thumbnailFile.mimetype, MINIO_BUCKET_NAME);
        }
        const article = await models_1.Article.create({
            title,
            content,
            videoUrl, // Save the video URL
        });
        // Handle tags
        if (tags) {
            const tagNames = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
            if (tagNames.length > 0) {
                const tagInstances = await Promise.all(tagNames.map((name) => models_1.Tag.findOrCreate({ where: { name } })));
                // addTags is a Sequelize auto-generated method
                await article.addTags(tagInstances.map((t) => t[0]));
            }
        }
        // Handle categories
        if (categories) {
            const categoryNames = categories
                .split(",")
                .map((category) => category.trim())
                .filter((category) => category.length > 0);
            if (categoryNames.length > 0) {
                const categoryInstances = await Promise.all(categoryNames.map((name) => models_1.Category.findOrCreate({ where: { name } })));
                // addCategories is a Sequelize auto-generated method
                await article.addCategories(categoryInstances.map((c) => c[0]));
            }
        }
        const createdArticle = await models_1.Article.findByPk(article.id, {
            include: [
                { model: models_1.Tag, as: "tags" },
                { model: models_1.Category, as: "categories" },
            ],
        });
        res.status(201).json(createdArticle);
    }
    catch (error) { }
});
// --- READ ALL ARTICLES ---
router.get("/", async (req, res) => {
    try {
        const articles = await models_1.Article.findAll({
            include: [
                { model: models_1.Tag, as: "tags" },
                { model: models_1.Category, as: "categories" },
            ],
            order: [["publishedAt", "DESC"]],
        });
        res.status(200).json(articles);
    }
    catch (error) { }
});
// --- READ SINGLE ARTICLE ---
router.get("/:id", async (req, res) => {
    try {
        const article = await models_1.Article.findByPk(req.params.id, {
            include: [
                { model: models_1.Tag, as: "tags" },
                { model: models_1.Category, as: "categories" },
            ],
        });
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        res.status(200).json(article);
    }
    catch (error) {
        console.error("Error fetching article:", error);
        res
            .status(500)
            .json({ error: "Failed to fetch article", details: error.message });
    }
});
// --- UPDATE ARTICLE ---
router.put("/:id", async (req, res) => {
    const { title, content, tags, categories, videoUrl, imageUrl } = req.body;
    const articleId = req.params.id;
    try {
        const article = await models_1.Article.findByPk(articleId);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        await article.update({ title, content, videoUrl, imageUrl });
        // Update tags
        if (tags !== undefined) {
            const tagNames = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
            const tagInstances = await Promise.all(tagNames.map((name) => models_1.Tag.findOrCreate({ where: { name } })));
            await article.setTags(tagInstances.map((t) => t[0]));
        }
        // Update categories
        if (categories !== undefined) {
            const categoryNames = categories
                .split(",")
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0);
            const categoryInstances = await Promise.all(categoryNames.map((name) => models_1.Category.findOrCreate({ where: { name } })));
            await article.setCategories(categoryInstances.map((c) => c[0]));
        }
        const updatedArticle = await models_1.Article.findByPk(article.id, {
            include: [
                { model: models_1.Tag, as: "tags" },
                { model: models_1.Category, as: "categories" },
            ],
        });
        res.status(200).json(updatedArticle);
    }
    catch (error) {
        console.error("Error updating article:", error);
        res
            .status(500)
            .json({ error: "Failed to update article", details: error.message });
    }
});
// --- DELETE ARTICLE ---
router.delete("/:id", async (req, res) => {
    try {
        const article = await models_1.Article.findByPk(req.params.id);
        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }
        await article.destroy();
        res.status(204).send(); // No content
    }
    catch (error) {
        console.error("Error deleting article:", error);
        res
            .status(500)
            .json({ error: "Failed to delete article", details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=articles.js.map