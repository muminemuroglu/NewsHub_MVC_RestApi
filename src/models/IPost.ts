import mongoose, { Schema } from "mongoose";

export interface IPost{
  
  post: unknown;
  title: string;
  content: string;
  category: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  image?: string; //Resim yolu için optional alan
  createdAt?: Date;
  updatedAt?: Date;
}

const NewsSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true, minlength: 2, trim: true },
    content: { type: String, required: true, minlength: 2 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User referansı
    image: { type: String }, 
  },
  {
    timestamps: true 
  }
);

const PostDB = mongoose.model<IPost>("Post", NewsSchema);
export default PostDB;