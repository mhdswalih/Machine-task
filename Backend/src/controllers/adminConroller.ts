import { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel";
import category from "../models/category";
import productModel from "../models/productModel";
import { OrderModel } from "../models/orderModel";



export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone } = req.body;

    const existingUser = await userModel.findOne({email})

    if(existingUser){
      return res.status(409).json({message:"User with this email alredy exists"})
    }

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

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

  
    let searchQuery: any = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

  
    const users = await userModel.find(searchQuery) 
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    
    const totalUsers = await userModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      },
      message: 'Users fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};


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
        
       const existingCategory = await category.findOne({name})
       if(existingCategory){
        return res.status(409).json({message:'Category with this name alredy exists'})
       }
       
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
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    let searchQuery: any = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const categories = await category.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCategories = await category.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCategories / limit);

    res.status(200).json({
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      },
      message: 'Categories fetched successfully'
    });
  } catch (error) {
    next(error);
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
    const existProduct = await productModel.findOne({productName})
    if(existProduct){
      return res.status(409).json({message:"Product with this name alredy exists"})
    }
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

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

  
    let searchQuery: any = {};
    if (search) {
      searchQuery = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } },
          { 'categoryId.name': { $regex: search, $options: 'i' } }
        ]
      };
    }

   
    const products = await productModel.find(searchQuery)
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    
    const totalProducts = await productModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      },
      message: 'Products fetched successfully'
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [dashboardData] = await OrderModel.aggregate([
      {
        $facet: {
          totalUsers: [
            {
              $count: "count",
            },
          ],
          totalProducts: [
            {
              $count: "count",
            },
          ],
          totalOrders: [
            {
              $count: "count",
            },
          ],
          totalRevenue: [
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
              },
            },
          ],
        },
      },
    ]);


    const totalUsers = dashboardData.totalUsers[0]?.count || 0;
    const totalProducts = dashboardData.totalProducts[0]?.count || 0;
    const totalOrders = dashboardData.totalOrders[0]?.count || 0;
    const totalRevenue = dashboardData.totalRevenue[0]?.total || 0;

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};
