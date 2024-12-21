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
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (page < 1 || limit < 1) {
      throw new HttpError("Page and limit must be positive integers.", 400);
    }

    const skip = (page - 1) * limit;

    const vendors = await vendor
      .find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    if (!vendors || vendors.length === 0) {
      throw new HttpError("There are no vendors in the database!", 404);
    }

    const totalVendors = await vendor.countDocuments();
    const totalPages = Math.ceil(totalVendors / limit);

    logger.info("Vendors are successfully returned.");

    res.status(200).json({
      vendors,
      pagination: {
        currentPage: page,
        totalPages,
        totalVendors,
        pageSize: vendors.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
