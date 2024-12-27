import { z } from "zod";

const login= z.object({
  email: z.string().email(),
  password: z.string(),
});
export const AuthValidation = {
  login
}