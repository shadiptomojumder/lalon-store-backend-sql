import { z } from 'zod';

const productSchema = z.object({
  body: z.object({
    id:z.optional(z.number()),
    title: z.string(),
    short_des: z.string(),
    price: z.number(),
    discount: z.boolean(),
    discount_price: z.number(),
    image: z.string(),
    stock: z.boolean(),
    star: z.number(),
    remark: z.string(),
    category_id: z.number(),
    brand_id: z.number(),
  })
})
const getSingleProductSchema = z.object({
  params: z.object({
    id: z.number(),
  })
})

const updateProductSchema = productSchema.partial();

export const productValidation = {
  productSchema,
  updateProductSchema,
  getSingleProductSchema
}