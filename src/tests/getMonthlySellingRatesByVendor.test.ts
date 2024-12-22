import { getMonthlySellingRatesByVendor } from "../controllers/orderController";
import Vendor from "../models/vendor";
import ParentProduct from "../models/parent_product";
import Order from "../models/order";
import { Request, Response, NextFunction } from "express";
import HttpError from "../custom-errors/httpError";

const mockingoose = require("mockingoose");

describe("getMonthlySellingRatesByVendor", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  it("should return monthly selling rates for the vendor", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };
    const mockParentProducts = [
      { _id: "product_id_1" },
      { _id: "product_id_2" },
    ];
    const mockMonthlySales = [
      { _id: { year: 2023, month: 1 }, totalQuantitySold: 10 },
      { _id: { year: 2023, month: 2 }, totalQuantitySold: 20 },
    ];

    req.params = { vendorName: "testVendor", year: "2023" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn(mockParentProducts, "find");
    mockingoose(Order).toReturn(mockMonthlySales, "aggregate");

    await getMonthlySellingRatesByVendor(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { month: "Jan", totalQuantitySold: 10 },
      { month: "Feb", totalQuantitySold: 20 },
      { month: "Mar", totalQuantitySold: 0 },
      { month: "Apr", totalQuantitySold: 0 },
      { month: "May", totalQuantitySold: 0 },
      { month: "Jun", totalQuantitySold: 0 },
      { month: "Jul", totalQuantitySold: 0 },
      { month: "Aug", totalQuantitySold: 0 },
      { month: "Sep", totalQuantitySold: 0 },
      { month: "Oct", totalQuantitySold: 0 },
      { month: "Nov", totalQuantitySold: 0 },
      { month: "Dec", totalQuantitySold: 0 },
    ]);
  });

  it("should return 404 if vendor is not found", async () => {
    req.params = { vendorName: "Unknown Vendor", year: "2023" };

    mockingoose(Vendor).toReturn(null, "findOne");

    await getMonthlySellingRatesByVendor(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError("Vendor with name Unknown Vendor not found!", 404)
    );
  });

  it("should return 404 if no products found for the vendor", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };

    req.params = { vendorName: "testVendor", year: "2023" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn([], "find");

    await getMonthlySellingRatesByVendor(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError("No products found for vendor testVendor!", 404)
    );
  });

  it("should return 404 if no sales data is found for the vendor in the given year", async () => {
    const mockVendor = { _id: "vendor_id", name: "testVendor" };
    const mockParentProducts = [
      { _id: "product_id_1" },
      { _id: "product_id_2" },
    ];

    req.params = { vendorName: "testVendor", year: "2023" };

    mockingoose(Vendor).toReturn(mockVendor, "findOne");
    mockingoose(ParentProduct).toReturn(mockParentProducts, "find");
    mockingoose(Order).toReturn([], "aggregate");

    await getMonthlySellingRatesByVendor(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError(
        "There are no sales for vendor testVendor in year 2023.",
        404
      )
    );
  });

  it("should return 404 if required parameters are missing", async () => {
    req.params = { vendorName: "testVendor" };

    await getMonthlySellingRatesByVendor(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError("Missing parameter field(s): year.", 404)
    );
  });
});
