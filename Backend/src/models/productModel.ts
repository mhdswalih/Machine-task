import mongoose from "mongoose";

export interface Products {
   productName: string;
   categoryId: string;
   price: number;
   status: string;
}

const productSchema = new mongoose.Schema<Products>({
   productName: { type: String, required: true,unique :true },
   categoryId: {
      type: String,
      ref: 'Category',
      required: true
   },
   price: { type: Number, required: true },
   status: { type: String, required: true }
})

export default mongoose.model<Products>('Products', productSchema);