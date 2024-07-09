import {
  compareAnswer,
  comparePassword,
  hashAnswer,
  hashPassword,
} from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

// status code usage
// 201 -> for any API error message like validations(BE) or verifications(isAdmin)
// 200 => for all API success messages
// 400/401 => for all API catch() errors

// REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    // validation - backend
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "email is Required" });
    }
    if (!password) {
      return res.send({ message: "password is Required" });
    }
    if (!phone) {
      return res.send({ message: "phone number is Required" });
    }
    if (!address) {
      return res.send({ message: "address is Required" });
    }
    if (!answer) {
      return res.send({ message: "answer is Required" });
    }
    // check user
    const existingUser = await userModel.findOne({ email }); //{email:email}
    // existing user-validation
    if (existingUser) {
      return res.status(201).send({
        success: false,
        message: "Email Already registered please login",
      });
    }

    // register user
    // hash pwd
    const hashedPassword = await hashPassword(password);
    // hash(encrpting to protect user's answer ) answer
    const hashedAnswer = await hashAnswer(answer);
    // save db
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer: hashedAnswer,
    }).save();
    // .then(function(){
    //   console.log('registered data saved successfully in DB'.bgGreen.white);
    // })

    // sending register created msg to server-console
    console.log("Registered data saved successfully in DB".bgGreen.white);

    // REGISTER API
    res.status(200).send({
      success: true,
      message: "User Registered Successfully",
      user,
    }); //{user:user}
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

// LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // login validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    // decryting pwd
    // check user
    const user = await userModel.findOne({ email });
    // email/user validation
    if (!user) {
      return res.status(201).send({
        //400 gives axios-error
        success: false,
        message: "Email is not registered",
      });
    }
    // decryt
    const match = await comparePassword(password, user.password);
    // pwd validation
    if (!match) {
      return res.status(201).send({
        success: false,
        message: "Incorrect password",
      });
    }

    // create token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // login API
    // send data which are needed like
    res.status(200).send({
      success: true,
      // message: "Login Successfully",
      message: `Welcome ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

// forgotPasswordController
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    // validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      return res.status(400).send({ message: "newPassword is required" });
    }
    // // check user
    // const user = await userModel.findOne({email,answer});
    // // user validation
    // if(!user){
    //   return res.status(200).send({
    //     success:false,
    //     message:'Wrong Email Or Answer'
    //   })
    // }

    // check user
    const user = await userModel.findOne({ email });
    // email/user validation
    if (!user) {
      return res.status(201).send({
        //400 gives axios-error
        success: false,
        message: "Wrong Email",
      });
    }
    // decryt answer
    const matchAnswer = await compareAnswer(answer, user.answer);
    // pwd validation
    if (!matchAnswer) {
      return res.status(201).send({
        success: false,
        message: "Wrong Answer",
      });
    }

    // hashing New Password
    const hashedNewPassord = await hashPassword(newPassword);
    // Updating New Password in DB
    await userModel.findByIdAndUpdate(user._id, { password: hashedNewPassord });

    // sending response
    res.status(200).send({
      success: true,
      message: " Password Reset Successfully ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in forgot-password-reseting",
      error,
    });
  }
};

// UPDATE-REGISTER controller
export const updateRegisterController = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    // get initial user data to assign default values if values are not given
    const user = await userModel.findById(req.user._id);

    // save db
    const updatedUser = await userModel.findByIdAndUpdate(
      // or req.params.pid(params from FE)
      req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    // sending register created msg to server-console
    console.log("Updated registered data successfully in DB".bgGreen.white);

    // UPDATE API
    res.status(200).send({
      success: true,
      message: "User Data Updated Successfully",
      updatedUser: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    }); //{user:user}
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update registration",
      error,
    });
  }
};

// DELETE USER IN DB
export const deleteUserController = async (req,res) => {
  try{
    const { answer } = req.body; //answer will be DELETE from FE
    const { uid } = req.params;
    // console.log(id)
    if (!answer) {
      return res.status(201).send({
        error: "Answer is Required for Deleting User",
      });
    }
    let user;
    if (answer === "DELETE") {
      user = await userModel.findByIdAndDelete(uid);
    }else{
        return res.status(201).send({
            error:'Please enter answer correctly'
        })
    }

    // response to server console
    console.log("User Deleted Successfully".bgGreen.white);
    // not need to store deleted data and send through API
    // API
    res.status(200).send({
      success: true,
      message: `"${user?.name}" User Deleted Successfully`,
      // categoryName : category?.name
    });
  }catch(error){
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in DELETE-USER",
      error,
    });
  }
}

// test controllers (token)
export const testController = (req, res) => {
  res.send("Protected Route");
};

// orders(user)
export const getOrdersController = async (req, res) => {
  try {
    // orders data of user only
    const orders = await orderModel
      .find({ buyer: req.user._id }) // id from req login-token(authorization)
      .populate("buyer", "name"); // include only buyer(user) name
    // orders API
    res.json(orders); // direct API
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while Getting Orders",
      error,
    });
  }
};

//Admin-all-orders
// get All Manage Orders for Admin(route) Dashboard
export const getManageOrdersController = async (req, res) => {
  try {
    // order data of every user
    const orders = await orderModel
      .find({})
      // .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 }); // sort by latest orders
    // manage orders API
    res.json(orders); // direct API
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all manage orders",
      error,
    });
  }
};

// update order status
export const orderStatusController = async (req,res) => {
  try {
    // FE(user) provided data
    const { orderId } =req.params;
    const { status } =req.body; // selected status value from status-dropdown(FE)
    // update order status
    const orders = await orderModel.findByIdAndUpdate(orderId ,{status},{ new:true })
    // API
    // res.json(orders);
    res.status(200).send({
      success:true,
      message:"Order-Status Changed Successfully",
      orders,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Updating order status",
      error
    })
  }
}

// get all users in Admin dashboard
export const getAllUsersController = async (req,res) => {
  try {
    const users = await userModel.find({}).select("-password");
    // all users API
    res.status(200).send({
      success:true,
      message:"Fetched All Users Successfully",
      users,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:"Error in getting all users",
      error,
    })
  }
}

// change password
export const changePasswordController = async (req,res) => {
  try {
    // new password from user
    const {password} = req.body;
    // get initial user data to assign default values if values are not given
    const user = await userModel.findById(req.user._id);

    // hash pwd
    const hashedNewPassword = password ? await hashPassword(password) : undefined;
    // save new pwd in DB
    const updatedUserpwd = await userModel.findByIdAndUpdate(req.user._id , {
      password: hashedNewPassword || user.password,
    },{ new:true }) 
    // API 
    res.status(200).send({
      success:true,
      message:"Password Changed Successfully",
      userName:{
        name: updatedUserpwd.name,
      }
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:"Error in change password",
      error,
    })
  }
}