import { z } from "zod";
import { baseUserSchema } from "@/modules/user/user.schemas";


// User schema for createUser request sanitation/validation purposes only
export const createUserSchema = z.object({
  body: z.object(baseUserSchema),
});

// General user schema for all user operations
export const userSchema = z.object(baseUserSchema);

const login= z.object({
  email: z.string().email(),
  password: z.string(),
});
export const AuthValidation = {
  login
}