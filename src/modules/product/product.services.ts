import { paginationHelpers } from "@/helpers/paginationHelper";
import { IAuthUser, IGenericResponse } from "@/interfaces/common";
import { IPaginationOptions } from "@/interfaces/pagination";
import { Prisma, products } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import {
  categorySchema,
  categoryUpdateSchema,
  productSchema,
  productUpdateSchema,
} from "./product.schemas";
import { generateSku } from "./product.utils";

// Function to create a new product
const createProduct = async (req: Request) => {
  try {
    // Validate the request body against the product schema
    const parseBody = productSchema.safeParse(req.body);

    // If validation fails, collect error messages and throw a BAD_REQUEST error
    if (!parseBody.success) {
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Check if the provided category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { id: parseBody.data.categoryId },
    });

    if (!existingCategory) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Invalid category. Category does not exist."
      );
    }

    // Check if product already exists in the same category (to prevent duplicates)
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

    // Calculate finalPrice based on discount
    const finalPrice = parseBody.data.discount
      ? parseBody.data.price -
        (parseBody.data.price * parseBody.data.discount) / 100
      : parseBody.data.price;

    // Generate a unique SKU for the product
    const sku = generateSku(parseBody.data.categoryId, parseBody.data.name);

    // Create new product linked to the category
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

// Function to update an existing product
const updateProduct = async (req: Request) => {
  try {
    // Product Id
    const { id } = req.params;

    // Validate the request body against the product schema
    const parseBody = productUpdateSchema.safeParse(req.body);

    // If validation fails, collect error messages and throw a BAD_REQUEST error
    if (!parseBody.success) {
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Calculate finalPrice if price or discount is updated
    let finalPrice;
    if (
      parseBody.data.price !== undefined ||
      parseBody.data.discount !== undefined
    ) {
      const price =
        parseBody.data.price ??
        (await prisma.products.findUnique({ where: { id } }))?.price;
      const discount =
        parseBody.data.discount ??
        (await prisma.products.findUnique({ where: { id } }))?.discount;
      finalPrice = discount
        ? Number(price) - (Number(price) * discount) / 100
        : Number(price);
    }

    // Update the product with the provided fields
    const product = await prisma.products.update({
      where: { id },
      data: {
        ...parseBody.data,
        ...(finalPrice !== undefined && { finalPrice }),
      },
    });

    // If product is not found, throw a BAD_REQUEST error
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }
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

// Function to get all products with filters and pagination
const getAllProduct = async (
  filters: any,
  options: IPaginationOptions,
  authUser: IAuthUser
): Promise<IGenericResponse<products[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);

    const andConditions = [];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      andConditions.push({
        AND: Object.keys(filters).map((key) => {
          if (key === "name") {
            return {
              [key]: {
                contains: filters[key],
                mode: "insensitive" as Prisma.QueryMode, // Case-insensitive search
              },
            };
          } else if (key === "price") {
            return {
              [key]: {
                equals: parseFloat(filters[key]), // Ensure the price filter is a number
              },
            };
          } else if (key === "sku") {
            return {
              [key]: {
                contains: filters[key],
                mode: "insensitive" as Prisma.QueryMode, // Case-insensitive search
              },
            };
          }
          return {
            [key]: {
              equals: filters[key],
            },
          };
        }),
      });
    }

    const whereConditions: Prisma.productsWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.products.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : {
              createdAt: "asc",
            },
    });

    // Calculate the total number of products in the database
    const total = await prisma.products.count({
      where: whereConditions,
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };
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

// Function to get a single product by ID
const getSingleProduct = async (id: string) => {
  try {
    // Retrieve the product with the specified ID from the database
    const product = await prisma.products.findUnique({
      where: {
        id,
      },
    });

    // If the product is not found, throw a NOT_FOUND error
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

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

// Function to delete a single product by ID
const deleteSingleProduct = async (id: string) => {
  try {
    // Delete the product with the specified ID from the database
    const product = await prisma.products.delete({
      where: {
        id,
      },
    });

    // If the product is not found, throw a NOT_FOUND error
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
    }

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

// Function to delete multiple products by their IDs
const deleteMultipleProducts = async (ids: string[]) => {
  try {
    // Delete the products with the specified IDs from the database
    const products = await prisma.products.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // If no products are found to delete, throw a NOT_FOUND error
    if (products.count === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "No products found to delete");
    }

    return products;
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

// Function to create a new category
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

// Function to update an existing category
const updateCategory = async (req: Request) => {
  try {
    // Category Id
    const { id } = req.params;

    // Validate the request body against the category update schema
    const parseBody = categoryUpdateSchema.safeParse(req.body);

    // If validation fails, collect error messages and throw a BAD_REQUEST error
    if (!parseBody.success) {
      const errorMessages = parseBody.error.errors
        .map((error) => error.message)
        .join(",");
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessages);
    }

    // Generate a unique `value` from `title` if title is updated
    let generatedValue;
    if (parseBody.data.title) {
      generatedValue = parseBody.data.title
        .toLowerCase()
        .replace(/\s+/g, "_") // Convert spaces to underscores
        .replace(/[^a-z0-9_]/g, ""); // Remove special characters
    }

    // Update the category with the provided fields
    const category = await prisma.categories.update({
      where: { id },
      data: {
        ...parseBody.data,
        ...(generatedValue && { value: generatedValue }),
      },
    });

    // If category is not found, throw a NOT_FOUND error
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

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

// Function to get all categories
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

// Function to delete a category by ID
const deleteCategory = async (id: string) => {
  try {
    // Delete the category with the specified ID from the database
    const category = await prisma.categories.delete({
      where: {
        id,
      },
    });

    // If the category is not found, throw a NOT_FOUND error
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
    }

    return category;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handling Prisma Foreign Key Constraint Violation (P2003)
      if (error.code === "P2003") {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Cannot delete category. There are products linked to this category."
        );
      }
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
  updateProduct,
  getAllProduct,
  getSingleProduct,
  deleteSingleProduct,
  deleteMultipleProducts,
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
};
