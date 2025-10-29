import { Router } from "express";
import { addCategory, addProduct, addUser, createOrder, deleteCategory, deleteProduct, deleteUser, ediProduct, editCategory, editUser, getAllCategories, getAllProducts, getAllUsers, getDashboard } from "../controllers/adminConroller";
const adminRouters = Router();



adminRouters.get('/users',getAllUsers)
adminRouters.post('/users',addUser);
adminRouters.put('/users/:userId',editUser)
adminRouters.delete('/users/:userId',deleteUser)
adminRouters.post('/categories',addCategory)
adminRouters.get('/categories',getAllCategories)
adminRouters.put('/categories/:categoryId',editCategory)
adminRouters.delete('/categories/:categoryId',deleteCategory)
adminRouters.post('/products',addProduct)
adminRouters.get('/products',getAllProducts)
adminRouters.put('/products/:productId',ediProduct)
adminRouters.delete('/products/:productId',deleteProduct)
adminRouters.post('/orders',createOrder)
adminRouters.get('/dashboard',getDashboard)


export default adminRouters;