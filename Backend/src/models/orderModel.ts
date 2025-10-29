import mongoose, { Schema, Document } from "mongoose";


export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order extends Document {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Date;
}


const orderItemSchema = new Schema<OrderItem>({
  productId: { type: String, ref:'Products',required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});


const orderSchema = new Schema<Order>({
  userId: { type: String, ref:"User",required: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
});


export const OrderModel = mongoose.model<Order>("Order", orderSchema);
