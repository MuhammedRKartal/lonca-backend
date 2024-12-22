import { getAllVendors } from "../controllers/vendorController";
import vendor from "../models/vendor";
import { Request, Response, NextFunction } from "express";
import HttpError from "../custom-errors/httpError";

const mockingoose = require("mockingoose");

describe("getAllVendors", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
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

  it("should return a paginated list of vendors", async () => {
    const mockVendors = [{ name: "Vendor A" }, { name: "Vendor B" }];

    mockingoose(vendor).toReturn(mockVendors, "find");
    mockingoose(vendor).toReturn(mockVendors.length, "countDocuments");

    req.query = { page: "1", limit: "2" };

    await getAllVendors(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      vendors: expect.arrayContaining([
        expect.objectContaining({ name: "Vendor A" }),
        expect.objectContaining({ name: "Vendor B" }),
      ]),
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalVendors: 2,
        pageSize: 2,
      },
    });
  });

  it("should return 400 for invalid page or limit", async () => {
    req.query = { page: "-1", limit: "0" };

    await getAllVendors(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError("Page and limit must be positive integers.", 400)
    );
  });

  it("should return 404 if no vendors are found", async () => {
    mockingoose(vendor).toReturn([], "find");

    await getAllVendors(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new HttpError("There are no vendors in the database!", 404)
    );
  });
});
