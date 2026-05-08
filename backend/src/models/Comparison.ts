import mongoose from "mongoose";

const ComparisonSchema = new mongoose.Schema(
  {
    colleges: [
      {
        id: String,
        name: String,
        location: String,
        rating: Number,
        fees: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Comparison", ComparisonSchema);