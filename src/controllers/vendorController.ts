import { NextFunction, Request, Response } from "express";
import HttpError from "../custom-errors/httpError";
import vendor from "../models/vendor";
import logger from "../logger";

export const getAllVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendors = await vendor.find();
    if (!vendors) {
      throw new HttpError("Failed to fetch vendors!", 500);
    }

    if (vendors.length === 0) {
      throw new HttpError("There are no vendors in the database!", 404);
    }

    logger.info("Vendors are successfully returned.");
    res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};
