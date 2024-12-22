import { Request, Response, NextFunction } from "express";
import HttpError from "../custom-errors/httpError";
import Vendor from "../models/vendor";
import ParentProduct from "../models/parent_product";
import Order from "../models/order";
import logger from "../logger";
import { numberToMonth } from "../utils";

export const getTotalProductsInfoSoldByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { vendorName } = req.params;

  try {
    if (!vendorName) {
      const missingFields = [!vendorName && "vendorName"]
        .filter(Boolean)
        .join(", ");
      throw new HttpError(`Missing parameter field(s): ${missingFields}.`, 404);
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (page < 1 || limit < 1) {
      throw new HttpError("Page and limit must be positive integers.", 400);
    }

    const skip = (page - 1) * limit;

    const vendor = await Vendor.findOne({ name: vendorName });

    if (!vendor) {
      throw new HttpError(`Vendor with name ${vendorName} not found!`, 404);
    }

    const parentProducts = await ParentProduct.find({ vendor: vendor._id });

    if (!parentProducts.length) {
      throw new HttpError(`No products found for vendor ${vendorName}!`, 404);
    }

    const productIds = parentProducts.map((product) => product._id);

    const orders = await Order.aggregate([
      {
        $unwind: "$cart_item",
      },
      {
        $match: {
          "cart_item.product": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$cart_item.product",
          totalItemsSold: { $sum: "$cart_item.item_count" },
          totalPacksSold: { $sum: "$cart_item.quantity" },
          totalCogs: { $sum: "$cart_item.cogs" },
          totalMoneyEarned: { $sum: "$cart_item.price" },
        },
      },
      {
        $lookup: {
          from: "parent_products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: false,
          productName: "$productDetails.name",
          totalPacksSold: { $round: ["$totalPacksSold", 2] },
          totalMoneyEarned: { $round: ["$totalMoneyEarned", 2] },
          totalCogs: { $round: ["$totalCogs", 2] },
          totalItemsSold: { $round: ["$totalItemsSold", 2] },
        },
      },
      {
        $sort: {
          totalPacksSold: -1,
          totalMoneyEarned: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    if (!orders.length) {
      throw new HttpError(`No orders found for vendor ${vendorName}!`, 404);
    }

    //This part is to calculate the pagination size
    const totalOrders = await Order.aggregate([
      {
        $unwind: "$cart_item",
      },
      {
        $match: {
          "cart_item.product": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$cart_item.product",
        },
      },
    ]);

    const totalRecords = totalOrders.length;
    const totalPages = Math.ceil(totalRecords / limit);

    logger.info(
      `Information of sold products by vendor ${vendorName} calculated successfully.`
    );

    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        pageSize: orders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySellingRatesByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { vendorName, year } = req.params;

  try {
    if (!vendorName || !year) {
      const missingFields = [!vendorName && "vendorName", !year && "year"]
        .filter(Boolean)
        .join(", ");
      throw new HttpError(`Missing parameter field(s): ${missingFields}.`, 404);
    }

    const vendor = await Vendor.findOne({ name: vendorName });

    if (!vendor) {
      throw new HttpError(`Vendor with name ${vendorName} not found!`, 404);
    }

    const parentProducts = await ParentProduct.find({ vendor: vendor._id });

    if (!parentProducts || !parentProducts.length) {
      throw new HttpError(`No products found for vendor ${vendorName}!`, 404);
    }

    const productIds = parentProducts.map((product) => product._id);

    const monthlySales = await Order.aggregate([
      // Deconstructs chart_items in an array to evaluate them separately.
      {
        $unwind: "$cart_item",
      },
      // Match the vendor's products and filter by year.
      {
        $match: {
          "cart_item.product": { $in: productIds },
          $expr: { $eq: [{ $year: "$payment_at" }, parseInt(year)] },
        },
      },
      // Group by year and month, and calculate total sales for each month.
      {
        $group: {
          _id: {
            year: { $year: "$payment_at" },
            month: { $month: "$payment_at" },
          },
          totalQuantitySold: { $sum: "$cart_item.quantity" },
        },
      },
      // Sort by year and month.
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    if (!monthlySales || !monthlySales.length) {
      throw new HttpError(
        `There are no sales for vendor ${vendorName} in year ${year}.`,
        404
      );
    }

    const result = Array.from({ length: 12 }, (_, i) => ({
      month: numberToMonth(i + 1),
      totalQuantitySold: 0,
    }));

    monthlySales.forEach((sale) => {
      result[sale._id.month - 1].totalQuantitySold = sale.totalQuantitySold;
    });

    logger.info(
      `Monthly selling rates for vendor ${vendorName} in ${year} calculated successfully.`
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
