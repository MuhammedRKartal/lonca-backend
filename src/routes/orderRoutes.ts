import { Router } from "express";
import {
  getMonthlySellingRatesByVendor,
  getTotalProductsInfoSoldByVendor,
} from "../controllers/orderController";

const router = Router();

router.get("/:vendorName", getTotalProductsInfoSoldByVendor);
router.get("/monthly/:vendorName/:year", getMonthlySellingRatesByVendor);

export default router;
