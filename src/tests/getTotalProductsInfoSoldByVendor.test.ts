import { getTotalProductsInfoSoldByVendor } from "../controllers/orderController";
import Vendor from "../models/vendor";
import ParentProduct from "../models/parent_product";
import Order from "../models/order";
import { Request, Response, NextFunction } from "express";
import HttpError from "../custom-errors/httpError";

const mockingoose = require("mockingoose");

describe("getTotalProductsInfoSoldByVendor", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should return total product info sold by vendor", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };
    const mockParentProducts = [
      { _id: "product_id_1", name: "Product 1" },
      { _id: "product_id_2", name: "Product 2" },
    ];
    const mockOrders = [
      {
        totalItemsSold: 50,
        totalPacksSold: 10,
        totalCogs: 500,
        totalMoneyEarned: 1000,
        productName: "Product 1",
      },
    ];

    req.params = { vendorName: "testVendor" };
    req.query = { page: "1", limit: "2" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn(mockParentProducts, "find");
    mockingoose(Order).toReturn(mockOrders, "aggregate");

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      orders: [
        expect.objectContaining({
          productName: "Product 1",
          totalItemsSold: 50,
          totalPacksSold: 10,
          totalCogs: 500,
          totalMoneyEarned: 1000,
        }),
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 1,
        pageSize: 1,
      },
    });
  });

  it("should return 404 if vendor is not found", async () => {
    req.params = { vendorName: "404Vendor" };

    mockingoose(Vendor).toReturn(null, "findOne");

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      new HttpError("Vendor with name 404Vendor not found!", 404)
    );
  });

  it("should return 404 if no products found for the vendor", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };

    req.params = { vendorName: "testVendor" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn([], "find");

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      new HttpError("No products found for vendor testVendor!", 404)
    );
  });

  it("should return 404 if no orders found for vendor", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };
    const mockParentProducts = [
      { _id: "product_id_1" },
      { _id: "product_id_2" },
    ];

    req.params = { vendorName: "testVendor" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn(mockParentProducts, "find");
    mockingoose(Order).toReturn([], "aggregate");

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      new HttpError("No orders found for vendor testVendor!", 404)
    );
  });

  it("should return 400 for invalid page or limit", async () => {
    req.params = { vendorName: "testVendor" };
    req.query = { page: "-1", limit: "0" };

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      new HttpError("Page and limit must be positive integers.", 400)
    );
  });

  it("should return 404 if required parameters are missing", async () => {
    req.params = {};

    await getTotalProductsInfoSoldByVendor(
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(
      new HttpError("Missing parameter field(s): vendorName.", 404)
    );
  });
});
