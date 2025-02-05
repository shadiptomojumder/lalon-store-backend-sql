import asyncErrorHandler from "@/shared/asyncErrorHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "@/shared/ApiResponse";
import { ProductService } from "./product.services";

const createProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req);
  ApiResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product created",
    data:  product ,
  });
});



const getSingleProduct = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const product = await ProductService.getSingleProduct(id);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Product fetched",
      data: { product },
    });
  }
);

const createCategory = asyncErrorHandler(async (req: Request, res: Response) => {
  const category = await ProductService.createCategory(req);
  ApiResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category created",
    data: category ,
  });
});

// 
const getAllCategory = asyncErrorHandler(async (req: Request, res: Response) => {
  const category = await ProductService.getAllCategory(req);
  ApiResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All category fetched",
    data: category ,
  });
});

export const productController = {
  createProduct,
  getSingleProduct,
  createCategory,
  getAllCategory
};
