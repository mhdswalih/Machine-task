import { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel";
import category from "../models/category";
import productModel from "../models/productModel";
import { OrderModel } from "../models/orderModel";



export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone } = req.body;

    const newUser = new userModel({
      name: name,
      email,
      phone: phone,
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const user = await userModel.find();
        res.status(200).json({users : user})
    } catch (error) {
        
    }
}


export const editUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const updateUser = await userModel.findByIdAndUpdate(userId, req.body, { new: true });

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updateUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req:Request,res:Response,next:NextFunction) => {
    try {
        const {userId} = req.params;
        const deleteUser = await userModel.findByIdAndDelete(userId)
        res.status(200).json({message:'User deleted successfully',user: deleteUser})
    } catch (error) {
        next(error)
    }
}

export const addCategory = async(req:Request,res:Response,next:NextFunction) => {
    try {
       const { name, description } = req.body.categoryData;      
        const newCategory = new category({
            name,
            description,
        })
        await newCategory.save()
        res.status(200).json({message:'Category added successfully',category:newCategory})
    } catch (error) {
        next(error)
    }
}

export const getAllCategories = async(req:Request,res:Response,next:NextFunction) => {
  try {
     const categories = await category.find();
     res.status(200).json({categories})
  } catch (error) {
    
  }
}
export const editCategory = async(req:Request,res:Response,next:NextFunction) => {
  try {
    const {categoryId} = req.params;
    const updatedCategory = await category.findByIdAndUpdate(categoryId,req.body.categoryData,{new:true})
      res.status(200).json({message:'Category updated successfully',category: updatedCategory})
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async(req:Request,res:Response,next:NextFunction) => {
  try {
    const {categoryId} = req.params
    const deleteCategory = await category.findByIdAndDelete(categoryId)
    res.status(200).json({message:'Category deleted successfully',category : deleteCategory})
  } catch (error) {
    next(error)
  }
}

export const addProduct = async(req:Request,res:Response,next:NextFunction) => {
  try {
    const {productName,categoryId,price,status} = req.body;    
    const newProducts = new productModel({
      productName,
      categoryId,
      price,
      status 
       })
       await newProducts.save()
       res.status(201).json({message:'Product added successfully',product:newProducts})
  } catch (error) {
    next(error)
  }
}

export const getAllProducts = async(req:Request,res:Response,next:NextFunction) => {
  try {
     const products = await productModel.find().populate('categoryId');
     res.status(200).json({products})
  } catch (error) {
    next(error)
  }
}

export const ediProduct = async(req:Request,res:Response,next:NextFunction) => {
  try {
    const {productId} = req.params;
    const updatedProducts = await productModel.findByIdAndUpdate(productId,req.body.productData,{new: true})
    res.status(200).json({message : 'Product updated successfully',product:updatedProducts})
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async(req:Request,res:Response,next:NextFunction) => {
  try {
    const {productId} = req.params;
    const deleteProduct = await productModel.findByIdAndDelete(productId)
    res.status(200).json({message:'Product deleted successfully',products :deleteProduct}) 
  } catch (error) {
    next(error)
  }
}



export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderData } = req.body; 

    if (!orderData) {
      return res.status(400).json({
        message: "Missing orderData in request body"
      });
    }
    const { userId, productId, quantity, totalAmount } = orderData;
    if (!userId) {
      return res.status(400).json({
        message: "Missing required field: userId"
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "Missing required field: productId"
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Missing or invalid required field: quantity"
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        message: "Missing or invalid required field: totalAmount"
      });
    }
    const unitPrice = totalAmount / quantity;

    const items = [{
      productId: productId,
      quantity: quantity,
      price: unitPrice 
    }];

    const newOrder = new OrderModel({
      userId: userId,
      items: items,
      totalAmount: totalAmount,
      orderDate : new Date()
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(error);
  }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Count total users
    const totalUsers = await userModel.countDocuments();

    // Count total products
    const totalProducts = await productModel.countDocuments();

    // Count total orders
    const totalOrders = await OrderModel.countDocuments();

    // Calculate total revenue (sum of all order.totalAmount)
    const result = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    // Send the data
    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    next(error);
  }
};