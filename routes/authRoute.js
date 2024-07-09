import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateRegisterController,
  getOrdersController,
  getManageOrdersController,
  orderStatusController,
  getAllUsersController,
  changePasswordController,
  deleteUserController,
} from "../controllers/authControllers.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// router object
const router = express.Router();

// routing
// REGISTER || METHOD POST
router.post("/register", registerController);

// UPDATE-REGISTER(Profile) || METHOD PUT
// router.put("/update-register/:pid", requireSignIn ,updateRegisterController);
router.put("/update-register", requireSignIn ,updateRegisterController);

// DELETE-USER \\ METHOD DELETE
router.delete("/delete-user/:uid",requireSignIn,isAdmin,deleteUserController)

// LOGIN || METHOD POST
router.post("/login", loginController);

// FORGOT PASSWORD || METHOD POST
router.post("/forgot-password", forgotPasswordController);

// test routes(token)
router.get("/test", requireSignIn, isAdmin, testController);

// protected User route(auth) for user-dashboard
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// protected Admin route(auth) with 2 conditions for admin-dashboard
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// orders(user-route)
router.get('/orders', requireSignIn, getOrdersController)

// Manage all orders of all users(Admin-route)
router.get('/manage-orders', requireSignIn,isAdmin , getManageOrdersController)

// update order status
router.put("/order-status/:orderId", requireSignIn , isAdmin , orderStatusController)

// All Users in Admin DashBoard
router.get('/all-users', requireSignIn,isAdmin, getAllUsersController);

// User(or admin) Change password
router.put('/change-password', requireSignIn , changePasswordController);

export default router;
