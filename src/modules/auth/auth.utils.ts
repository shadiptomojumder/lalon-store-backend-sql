import { jwtHelpers } from '@/helpers/jwtHelpers';
import * as bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';

async function comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
        const match: boolean = await bcrypt.compare(plainTextPassword, hashedPassword);
        return match;
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
}

const generateToken = (payload: Record<string, unknown>, secret: Secret, expiresIn: string) => {
    return jwtHelpers.createToken(payload, secret, expiresIn);
  };

export const AuthUtils = {
    comparePasswords,
    generateToken
}