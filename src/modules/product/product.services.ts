import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import { categorySchema, productSchema } from "./product.schemas";
import { generateSku } from "./product.utils";

const createProduct = async (req: Request) => {
  try {
    // Validate the request body against the product schema
    const parseBody = productSchema.safeParse(req.body);
    console.log("parseBody is:", parseBody);
    

    // If validation fails, collect error messages and throw a BAD_REQUEST error
    if (!parseBody.success) {
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // ✅ Check if the provided category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { id: parseBody.data.categoryId },
    });

    if (!existingCategory) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Invalid category. Category does not exist."
      );
    }

    // ✅ Check if product already exists in the same category (to prevent duplicates)
    const existingProduct = await prisma.products.findFirst({
      where: {
        name: parseBody.data.name,
        categoryId: parseBody.data.categoryId, // Ensure the product is unique per category
      },
    });

    if (existingProduct) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Product with this name already exists in this category."
      );
    }

    // ✅ Calculate finalPrice based on discount
    const finalPrice = parseBody.data.discount
      ? parseBody.data.price -
        (parseBody.data.price * parseBody.data.discount) / 100
      : parseBody.data.price;

    // ✅ Generate a unique SKU for the product
    const sku = generateSku(parseBody.data.categoryId,parseBody.data.name)

    // ✅ Create new product linked to the category
    const product = await prisma.products.create({
      data: {
        ...parseBody.data,
        finalPrice,
        sku,
        
      },
    });
    return product;
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An unknown error occurred"
      );
    }
  }
};

const getSingleProduct = async (id: string) => {
  const product = await prisma.products.findUnique({
    where: {
      id,
    },
  });
  if (!product)
    throw new ApiError(StatusCodes.BAD_REQUEST, "product not found!!");
  return product;
};

const createCategory = async (req: Request) => {
  try {
    // Validate the request body against the category schema
    const parseBody = categorySchema.safeParse(req.body);

    // If validation fails, collect error messages and throw a BAD_REQUEST error
    if (!parseBody.success) {
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Generate a unique `value` from `title`
    const generatedValue = parseBody.data.title
      .toLowerCase()
      .replace(/\s+/g, "_") // Convert spaces to underscores
      .replace(/[^a-z0-9_]/g, ""); // Remove special characters

    console.log("generatedValue is:", generatedValue);

    // Check if a category with the same title or value already exists
    const existingCategory = await prisma.categories.findFirst({
      where: {
        OR: [
          { title: parseBody.data.title }, // Check for duplicate title
          { value: generatedValue }, // Check for duplicate value
        ],
      },
    });

    // If category exists, throw a CONFLICT error
    if (existingCategory) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Category with this title or value already exists"
      );
    }

    // Create a new category in the database
    const category = await prisma.categories.create({
      data: {
        ...parseBody.data,
        value: generatedValue,
      },
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An unknown error occurred"
      );
    }
  }
};

const getAllCategory = async (req: Request) => {
  try {
    // Retrieve all categories with all fields from the database
    const categories = await prisma.categories.findMany();
    if (!categories) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "categories not found!!");
    }

    return categories;
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    } else {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "An unknown error occurred"
      );
    }
  }
};

export const ProductService = {
  createProduct,
  getSingleProduct,
  createCategory,
  getAllCategory,
};
