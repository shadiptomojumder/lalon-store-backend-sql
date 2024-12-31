import asyncErrorHandler from "@/shared/asyncErrorHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "@/shared/ApiResponse";
import { productService } from "./product.services";

const createProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  ApiResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product created",
    data: { product },
  });
});

const getSingleProduct = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const product = await productService.getSingleProduct(id);
    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Product fetched",
      data: { product },
    });
  }
);

export const productController = {
  createProduct,
  getSingleProduct,
};
