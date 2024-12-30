import { jwtHelpers } from '@/helpers/jwtHelpers';
import * as bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';

// Assign the comparePasswords function to the comparePasswords property of AuthUtils
async function comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
        const match: boolean = await bcrypt.compare(plainTextPassword, hashedPassword);
        return match;
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
}
// Assign the generateToken function to the generateToken property of AuthUtils
const generateToken = (payload: Record<string, unknown>, secret: Secret, expiresIn: string) => {
    return jwtHelpers.createToken(payload, secret, expiresIn);
  };

export const AuthUtils = {
    comparePasswords,
    generateToken
}