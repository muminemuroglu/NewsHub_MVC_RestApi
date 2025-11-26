import mongoose from "mongoose";
import PostDB, { IPost } from "../../models/IPost";
import { IResult, jsonResult } from "../../models/IResult";
import CategoryDB from "../../models/ICategory";

// Haber ekleme 
export const addPosts = async (data: IPost, userid: any) => {
  try {
    if (!data.title || !data.content || !data.category) {
      return jsonResult(400, false, "Title, content and category are required", null);
    }
    data.author = userid
    const posts = new PostDB(data);
    await posts.save();
    return jsonResult(201, true, "Posts added successfully", {
      id: posts._id,
      title: posts.title
    });
  } catch (error: any) {
    console.error("Add Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
}

// Haber düzenleme (Admin)
export const editPosts = async (postId: string, postData: any): Promise<IResult> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return jsonResult(400, false, "Invalid id", null);
    }

    const updates: any = {};

    // Title güncellenmek isteniyorsa
    if (postData?.title !== undefined) updates.title = postData.title;

    // Content güncellenmek isteniyorsa
    if (postData?.content !== undefined) updates.content = postData.content;

    // Kategori güncellenmek isteniyorsa:
    if (postData?.categoryId !== undefined) {
      const categoryId = postData.categoryId;
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return jsonResult(400, false, "Invalid categoryId", null);
      }

      const category = await CategoryDB.findById(categoryId);
      if (!category) {
        return jsonResult(404, false, "Category not found", null);
      }

      updates.category = categoryId;
    }

    // Mongoose timestamps sayesinde updatedAt otomatik güncellenir
    const updatedPosts = await PostDB.findByIdAndUpdate(
      postId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category", "name description isactive");

    if (!updatedPosts) {
      return jsonResult(404, false, "Posts not found", null);
    }

    return jsonResult(200, true, "Posts updated successfully", updatedPosts);
  } catch (error: any) {
    console.error("Edit Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
};

// Haber silme (Admin)
export const removePosts = async (postId: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return jsonResult(400, false, "Invalid id", null);
    }

    const deleted = await PostDB.findByIdAndDelete(postId);
    if (!deleted) {
      return jsonResult(404, false, "Posts not found", null);
    }

    return jsonResult(200, true, "Posts deleted successfully", {
      id: deleted._id,
      title: deleted.title
    });
  } catch (error: any) {
    console.error("Remove Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
};

// Haberleri listeleme
export const postsListAll = async (page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    const items = await PostDB.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await PostDB.countDocuments();

    return jsonResult(200, true, "All posts fetched successfully", {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error("List All Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
}

// Haber arama (sayfalama) (Admin, User)
export const searchPosts = async (q: string, page: number = 1, limit: number = 10) => {
  try {
    if (!q || q.trim().length === 0) {
      return jsonResult(400, false, "Query parameter 'q' is required", null);
    }

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
    const skip = (safePage - 1) * safeLimit;
    const regex = new RegExp(q, "i");

    const filter = { $or: [{ title: regex }, { content: regex }] };

    const [items, total] = await Promise.all([
      PostDB.find(filter).skip(skip).limit(safeLimit).sort({ createdAt: -1 }),
      PostDB.countDocuments(filter)
    ]);

    return jsonResult(200, true, "Search results fetched", {
      items,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      query: q
    });
  } catch (error: any) {
    console.error("Search Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
};


// Haber güncelleme (Admin)
export const updatePosts = async (postId: string, data: Partial<{ title: string, content: string, category: string}>) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return jsonResult(400, false, "Invalid id", null);
    }

    const updated = await PostDB.findByIdAndUpdate(
      postId,
      { ...data },
      { new: true, runValidators: true } // runValidators: şema kurallarını kontrol etsin
    );

    if (!updated) {
      return jsonResult(404, false, "Posts not found", null);
    }

    return jsonResult(200, true, "Posts updated successfully", updated);
  } catch (error: any) {
    console.error("Update Posts Error:", error);
    return jsonResult(500, false, "Internal server error", error.message);
  }
};