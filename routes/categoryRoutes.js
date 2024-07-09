import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

// routes
// create category route
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

// update category route
router.put("/update-category/:id", updateCategoryController);

// Get(REad) All categories
router.get("/get-category", categoryController);

// Get(REad) Single Category
router.get("/single-category/:slug", singleCategoryController);

// Delete Category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
