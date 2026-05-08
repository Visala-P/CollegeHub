import express from "express";
import Comparison from "../models/Comparison.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  console.log("SAVE ROUTE HIT");
    try {
    const { colleges } = req.body;
    console.log(colleges);
    if (!colleges || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No colleges selected",
      });
    }

    const savedComparison = await Comparison.create({
      colleges,
    });

    res.status(201).json({
      success: true,
      message: "Comparison saved successfully",
      data: savedComparison,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Comparison route works",
  });
});
export default router;