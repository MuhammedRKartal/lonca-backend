import { Request, Response, NextFunction } from "express";
import HttpError from "../custom-errors/httpError";
import Vendor from "../models/vendor";
import ParentProduct from "../models/parent_product";
import Order from "../models/order";
import logger from "../logger";

export const getTotalProductsInfoSoldByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { vendorName } = req.params;

  if (!vendorName) {
    const missingFields = [!vendorName && "vendorName"]
      .filter(Boolean)
      .join(", ");
    throw new HttpError(`Missing field(s): ${missingFields}.`, 404);
  }

  try {
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
      // Deconstructs chart_items in a array to evaluate them seperately.
      {
        $unwind: "$cart_item",
      },
      // Find the products of given Vendor in those deconstructed elements.
      {
        $match: {
          "cart_item.product": { $in: productIds },
        },
      },
      // Sum up the values for each product.
      {
        $group: {
          _id: "$cart_item.product",
          totalPacksSold: { $sum: "$cart_item.quantity" },
          totalCogs: { $sum: "$cart_item.cogs" },
          totalMoneyEarned: { $sum: "$cart_item.price" },
        },
      },
      // Left outer join
      {
        $lookup: {
          from: "parent_products", // collection to join
          localField: "_id", // field from the input documents
          foreignField: "_id", // field from the documents of the "from" collection
          as: "productDetails", // output array field
        },
      },
      // Deconstructing the productDetails array that we just combined with outer join, (it has only 1 field which is productName)
      {
        $unwind: "$productDetails",
      },
      // Setup of returned values.
      {
        $project: {
          _id: false,
          productName: "$productDetails.name",
          totalPacksSold: true,
          totalMoneyEarned: true,
          totalCogs: true,
        },
      },
      {
        $sort: {
          totalPacksSold: -1,
          totalMoneyEarned: -1,
        },
      },
    ]);

    if (!orders.length) {
      throw new HttpError(`No orders found for vendor ${vendorName}!`, 404);
    }

    logger.info(
      `Information of sold products by vendor ${vendorName} calculated successfully.`
    );
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
