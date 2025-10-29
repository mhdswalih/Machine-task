import mongoose, { Schema, Document } from "mongoose";


export interface Category extends Document {
  name: string;
  description: string;
}


const categorySchema = new Schema<Category>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});


export default mongoose.model<Category>("Category", categorySchema);
