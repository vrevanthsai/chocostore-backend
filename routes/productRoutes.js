import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productFiltersController,
  productPhotoController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

// product Routers
// create product
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

// get all products[R] in Admin dashboard
// router.get("/get-products/:page", getProductController);
router.get("/get-products/:perpage/:page", getProductController);

// get single product
// router.get("/get-product/:slug", getSingleProductController);
router.get("/single-product/:slug", getSingleProductController);

// get photo
router.get("/product-photo/:pid", productPhotoController);

// delete product
router.delete("/delete-product/:pid", deleteProductController);

// filter product
// router.post("/product-filters", productFiltersController);
router.post("/product-filters/:page", productFiltersController);

// search product
// router.get('/search/:keyword', searchProductController);
router.get('/search/:keyword/:page', searchProductController);

// similar products
router.get('/related-product/:pid/:cid', relatedProductController);

// category wise products
router.get('/product-categroy/:slug/:page', productCategoryController);

//Payments routes
//get Token(from Braintree for verification)
router.get('/braintree/token', braintreeTokenController)

//payments
router.post('/braintree/payment' , requireSignIn , braintreePaymentController)

export default router;
