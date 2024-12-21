import { Router } from "express";
import { getAllVendors } from "../controllers/vendorController";

const router = Router();

router.get("/", getAllVendors);

export default router;
