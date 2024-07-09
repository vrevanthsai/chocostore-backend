// modified code in search controller and getProductController , productCategoryController
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

// payment gateway setup
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    // const {name} = req.body;
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields; //contains non-file fields
    // file fields
    const { photo } = req.files;
    // 201 for validation error msgs and 200 for success msgs and 500/400 for other errors
    // validation
    switch (true) {
      case !name:
        return res.status(201).send({ error: "Name is required" });
      case !description:
        return res.status(201).send({ error: "Description is required" });
      case !price:
        return res.status(201).send({ error: "price is required" });
      case !category:
        return res.status(201).send({ error: "category is required" });
      case !quantity:
        return res.status(201).send({ error: "quantity is required" });
      case !photo:
        return res.status(201).send({ error: "photo(image) is required" });
      case photo && photo.size > 1000000: //100000
        return res.status(201).send({
          error: "Photo Size should be less than 1MB",
        }); //201
      case !shipping:
        return res.status(201).send({ error: "Shipping is required" });
    }
    // new copy of data
    const products = new productModel({ ...req.fields, slug: slugify(name) });
    // photo validation(Adding photo-data in productModel)
    // If photo exists, validate size and save it
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    // full data save
    await products.save();
    // sending product created msg to server-console
    console.log("Product Created Successfully in DB".bgGreen.white);
    //Product-create(C) API
    res.status(200).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error,
    });
  }
};

// get all products with pagination for both Homepage, Admin-Products
export const getProductController = async (req, res) => {
  try {
    const total = await productModel.find({}).select("-photo").estimatedDocumentCount();

     //--- Pagination-logic ---
    //  const perPage = 6; // give same perPage in Admin->Products.js->Pagination-props
    const perPage = req.params.perpage ? req.params.perpage : 3;
     const page = req.params.page ? req.params.page : 1;

     const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    // all products without photo API
    res.status(200).send({
      success: true,
      countTotal: products.length,
      totalProducts: total,
      message: "All products with pagination",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting all products",
      // error,
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    // params validation- when given params are wrong
     if(!product){
      return res.status(201).send({ error: "Page not Found" });
     }

    // get single product API without photo
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    // contains only photo data of product(given pid)
    const product = await productModel.findById(req.params.pid).select("photo");
    // checking photo data
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data); //sending photo data
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

// delete Product
export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    // sending product created msg to server-console
    console.log("Product Deleted Successfully in DB".bgGreen.white);
    // API
    res.status(200).send({
      success: true,
      message: `"${product?.name}" Product Deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// update product
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields; //contains non-file fields
    // file fields
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name:
        return res.status(401).send({ error: "Name is required" });
      case !description:
        return res.status(401).send({ error: "Description is required" });
      case !price:
        return res.status(401).send({ error: "price is required" });
      case !category:
        return res.status(201).send({ error: "category is required" });
      case !quantity:
        return res.status(401).send({ error: "quantity is required" });
      // case !photo:
      //   return res.status(201).send({ error: "photo(image) is required" });
      case photo && photo.size > 1000000: //100000
        return res.status(201).send({
          error: "Phono Size should be less than 1MB",
        }); //201
      case !shipping:
        return res.status(201).send({ error: "Shipping is required" });
    }
    // new copy of data
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    // adding photo(or updated photo) to product
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    // full data save
    await products.save();
    // sending product created msg to server-console
    console.log("Product updated Successfully in DB".bgGreen.white);
    //Product-create(C) API
    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error,
    });
  }
};

// Filters for Category & Price with pagination logic
export const productFiltersController = async (req, res) => {
  try {
    // ---filter logic ---
    const { checked, radio } = req.body; //object-destructuring
    //creating Query-arguments
    let args = {}; //empty
    if (checked.length > 0) args.category = checked; // adding key:value(category:[cat-ids(multiple)]) to args-Object
    // using Mongodb Query-operations
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }; //ex [0<,>19] & adding price:range to args
    // console.log(args)

    // used for finding total number of products are there after filtering
    const totalProducts = await productModel.find(args).select("-photo");

    //--- Pagination-logic ---
    const perPage = 3;
    const page = req.params.page ? req.params.page : 1;

    // getting products based on query-arguments(args) with pagination
    const products = await productModel
      .find(args)
      .populate("category")
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    // Filter API
    res.status(200).send({
      success: true,
      countTotal: products.length, // number of pagination products
      filterTotal: totalProducts.length, // total number of filter products
      message: "Filtered products with pagination successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

// seacrh product
export const searchProductController = async (req, res) => {
  try {
    //----Search-filter-logic----
    const { keyword } = req.params;

    // total number of search-filter products for pagination
    const totalResults = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } }, // i -> case-insensitive
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo"); // add pagination logic

    //--- Pagination-logic ---will use these,when [prev,page,next]buttons pagination-logic is given in homepage
    const perPage = 3;  // give page limit here and same in FE
    const page = req.params.page ? req.params.page : 1;

    // search/filter products based on keyword in name & description fields
    // search-prodcuts with pagination
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1})
      .populate("category")

    //modified search API
    res.status(200).send({
      success: true,
      message:"Search Products with pagination successful",
      countTotal: results.length,
      totalProducts: totalResults.length,
      results,
    })

    // search API
    // res.json(results);
    // res.json(totalResults);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in Search Product API",
      error,
    });
  }
};

// similar products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    // query(filter) opertion
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }, // $ne -> not include
      })
      .select("-photo")
      .limit(3) // give limit or use pagination logic
      .populate("category")
      .sort({ createdAt: -1 });
    // similar products API
    res.status(200).send({
      success: true,
      message: "Similar/related products fetched Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related/similar products",
      error,
    });
  }
};

// get products by category(c.slug or use direct c.id in FE params)
export const productCategoryController = async (req, res) => {
  try {
    // use FE c.slug param & get category, products
    const category = await categoryModel.findOne({ slug: req.params.slug });
    // params validation
    if(!category){
      return res.status(201).send({ error: 'Page Not Found' })
    }

    const total = await productModel.find({ category }).select("-photo")

    // pagination
    const page = req.params.page ? req.params.page : 1;
    const perPage = 2; // same in FE

    const products = await productModel
      .find({ category })
      .select("-photo")
      .populate("category")
      .skip((page - 1 ) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })

    // API
    res.status(200).send({
      success: true,
      message: "Category Products fitched successfully with pagination",
      countTotal: products.length,
      totalProducts: total.length,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting products by category",
      error,
    });
  }
};

// Payment(braintree) gateway Controllers
// get Token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// make payment
export const braintreePaymentController = async (req, res) => {
  try {
    // cart from cart-products & nonce(naming-convention) from braintree(used in FE)
    const { cart, nonce } = req.body;
    // total price
    // let total = 0;
    // cart?.map((i) => {
    //   return (total += i.price)
    // });
    const total = cart.reduce((total,p) => total + (p.price * p.cartQuantity) , 0)

    // transaction
    let newTransaction = gateway.transaction.sale({
      amount:total,
      paymentMethodNonce: nonce,
      options:{
       submitForSettlement:true 
      }
    },
    function(error,result){
      if(result){
        const order = new orderModel({
          // products: cart,
          payment: result,
          buyer: req.user._id, 
          orderProducts:cart,
        }).save();
        res.json({ok:true})
      }else{
        res.status(500).send(error);
      }
    }
  )
  } catch (error) {
    console.log(error);
  }
};
