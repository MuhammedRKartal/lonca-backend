import { Router } from "express";
import { getTotalProductsInfoSoldByVendor } from "../controllers/orderController";

const router = Router();

router.get("/vendor/:vendorName", getTotalProductsInfoSoldByVendor);

export default router;
