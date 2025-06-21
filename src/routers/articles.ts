import { Router, Request, Response } from "express";
import { upload, uploadFileToS3 } from "../services/uploadService";
import { UploadedFile } from "../types/global";
import { Article, Category, Tag } from "../models";

const router = Router();

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

if (!MINIO_BUCKET_NAME) {
  throw new Error("MINIO_BUCKET_NAME is not defined in environment variables");
}

// Interface for request body when creating/updating an article.
interface ArticleRequestBody {
  title: string;
  content: string;
  tags?: string; // Comma-separated string
  categories?: string; // Comma-separated string
  videoUrl?: string; // For updates
  imageUrl?: string; // For updates
}

// --- CREATE ARTICLE ---
router.post(
  "/",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { title, content, tags, categories } = req.body as ArticleRequestBody;

    // Type assertion for req.files to ensure TypeScript knows its structure
    const files = req.files as
      | { video?: UploadedFile[]; thumbnail?: UploadedFile[] }
      | undefined;

    // Check req.files for the uploaded files
    const videoFile = files?.video?.[0]; // Get the first video file if present
    const thumbnailFile = files?.thumbnail?.[0]; // Get the first thumbnail file if present

    let videoUrl: string | undefined = undefined;
    let imageUrl: string | undefined = undefined;

    try {
      // Handle video upload if present
      if (videoFile) {
        videoUrl = await uploadFileToS3(
          videoFile.buffer,
          videoFile.originalname,
          videoFile.mimetype,
          MINIO_BUCKET_NAME
        );
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
        imageUrl = await uploadFileToS3(
          thumbnailFile.buffer,
          thumbnailFile.originalname,
          thumbnailFile.mimetype,
          MINIO_BUCKET_NAME
        );
      }

      const article = await Article.create({
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
          const tagInstances = await Promise.all(
            tagNames.map((name) => Tag.findOrCreate({ where: { name } }))
          );

          // addTags is a Sequelize auto-generated method
          await (article as any).addTags(tagInstances.map((t) => t[0]));
        }
      }

      // Handle categories
      if (categories) {
        const categoryNames = categories
          .split(",")
          .map((category) => category.trim())
          .filter((category) => category.length > 0);

        if (categoryNames.length > 0) {
          const categoryInstances = await Promise.all(
            categoryNames.map((name) =>
              Category.findOrCreate({ where: { name } })
            )
          );

          // addCategories is a Sequelize auto-generated method
          await (article as any).addCategories(
            categoryInstances.map((c) => c[0])
          );
        }
      }

      const createdArticle = await Article.findByPk(article.id, {
        include: [
          { model: Tag, as: "tags" },
          { model: Category, as: "categories" },
        ],
      });

      res.status(201).json(createdArticle);
    } catch (error) {}
  }
);

// --- READ ALL ARTICLES ---
router.get("/", async (req: Request, res: Response) => {
  try {
    const articles = await Article.findAll({
      include: [
        { model: Tag, as: "tags" },
        { model: Category, as: "categories" },
      ],
      order: [["publishedAt", "DESC"]],
    });

    res.status(200).json(articles);
  } catch (error) {}
});

// --- READ SINGLE ARTICLE ---
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        { model: Tag, as: "tags" },
        { model: Category, as: "categories" },
      ],
    });

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.status(200).json(article);
  } catch (error: any) {
    console.error("Error fetching article:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch article", details: error.message });
  }
});

// --- UPDATE ARTICLE ---
router.put("/:id", async (req: Request, res: Response) => {
  const { title, content, tags, categories, videoUrl, imageUrl } =
    req.body as ArticleRequestBody;
  const articleId = req.params.id;

  try {
    const article = await Article.findByPk(articleId);
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
      const tagInstances = await Promise.all(
        tagNames.map((name) => Tag.findOrCreate({ where: { name } }))
      );
      await (article as any).setTags(tagInstances.map((t) => t[0]));
    }

    // Update categories
    if (categories !== undefined) {
      const categoryNames = categories
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);
      const categoryInstances = await Promise.all(
        categoryNames.map((name) => Category.findOrCreate({ where: { name } }))
      );
      await (article as any).setCategories(categoryInstances.map((c) => c[0]));
    }

    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        { model: Tag, as: "tags" },
        { model: Category, as: "categories" },
      ],
    });

    res.status(200).json(updatedArticle);
  } catch (error: any) {
    console.error("Error updating article:", error);
    res
      .status(500)
      .json({ error: "Failed to update article", details: error.message });
  }
});

// --- DELETE ARTICLE ---
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    await article.destroy();
    res.status(204).send(); // No content
  } catch (error: any) {
    console.error("Error deleting article:", error);
    res
      .status(500)
      .json({ error: "Failed to delete article", details: error.message });
  }
});

export default router;
