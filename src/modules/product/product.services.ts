import { products } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../errors/ApiError';
import prisma from '../../shared/prisma';

const createProduct = async (prod: products): Promise<products> => {
  const product = await prisma.products.create({
    data: prod,
  });
  if (!product)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'product not created!!');
  return product;
};

const getSingleProduct = async (id: string) => {
  const product = await prisma.products.findUnique({
    where: {
      id,
    },
  });
  if (!product)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'product not found!!');
  return product;
};

export const productService = {
  createProduct,
  getSingleProduct,
};
