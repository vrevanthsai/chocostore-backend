import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // in order,it contains ordered products ids in Array,payment-details(from braintree),buyer(user)-id,status of order
    // products: [
    //   {
    //     type: mongoose.ObjectId,
    //     ref: "Products",
    //   },
    // ],
    orderProducts:[],//new
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users", // change it to "users"
    },
    status: {
      type: String,
      default: "Not Processed",
      enum: ["Not Processed", "Processing", "Shipped", "Delivered", "Canceled"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
