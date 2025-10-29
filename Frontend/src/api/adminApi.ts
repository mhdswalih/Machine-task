import type { IUser } from "../types/AddUser";
import { axiosInstance } from "./instance/axiosInstance";

export const addUser = async (userData : IUser ) => {
    console.log(userData,'THIS IS FROM API SIde');
    
    try {
        const response = await axiosInstance.post('/admin/users',userData)
        return response.data;
    } catch (error) {
        
    }
}

export const getAllUsers = async() => {
    try {
        const response = await axiosInstance.get(`/admin/users`);
        return response.data;
    } catch (error) {
        
    }
}

export const editUser = async(userId:string,userData: IUser) => {
    try {
        const response = await axiosInstance.put(`/admin/users/${userId}`,userData)
        return response.data
    } catch (error) {
        
    }
}

export const deleteUser = async(userId:string) => {
    try {
        const response = await axiosInstance.delete(`/admin/users/${userId}`)
        return response.data
    } catch (error) {
        
    }
}

export const addCategory = async(categoryData : {name :string,description: string}) =>{
    try {
        const response = await axiosInstance.post('/admin/categories',{categoryData})
        return response.data 
    } catch (error) {
        
    }
}

export const getAllCategories = async() => {
    try {
        const response = await axiosInstance.get('/admin/categories')
        return response.data
    } catch (error) {
        
    }
}

export const editCategory = async(categoryId:string,categoryData : {name : string,description:string}) => {
    try {
        const response = await axiosInstance.put(`/admin/categories/${categoryId}`,{categoryData})
        return response.data;
    } catch (error) {
        
    }
}

export const deleteCategory = async(categoryId:string) => {
    try {
        const response = await axiosInstance.delete(`/admin/categories/${categoryId}`)
        return response.data;
    } catch (error) {
        
    }
}

export const addProducts = async(productData : {productName :string,categoryId:string,price:number,status:string}) => {
    console.log(productData,'THIS IS PRODUCT DATA ');
    
    try {
        const response = await axiosInstance.post('/admin/products',productData)
        return response.data;
    } catch (error) {
        
    }
}

export const getAllProducts = async() => {
    try {
        const response = await axiosInstance.get(`/admin/products`);
        return response.data
    } catch (error) {
        
    }
}

export const editProduct  = async(productId:string,productData : {productName :string,categoryId:string,price:number,status:string}) => {
    try {
        const response = await axiosInstance.put(`/admin/products/${productId}`,{productData})
        return response.data
    } catch (error) {
        
    }
}

export const deleteProduct = async(productId:string) => {
    try {
        const response = await axiosInstance.delete(`/admin/products/${productId}`)
        return response.data
    } catch (error) {
        
    }
}

export const createOrder = async (orderData: { productId: string; quantity: number; totalAmount: number }) => {
    
  try {
    const response = await axiosInstance.post(`/admin/orders`, {orderData});
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export const Dashboard = async() => {
    try {
        const response = await axiosInstance.get('/admin/dashboard')
        return response.data
    } catch (error) {
        
    }
}