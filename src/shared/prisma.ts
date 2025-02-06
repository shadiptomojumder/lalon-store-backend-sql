import { PrismaClient, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

// Middleware to transform Decimal fields into Numbers
prisma.$use(async (params, next) => {
  const result = await next(params);

  if (params.model && params.model === Prisma.ModelName.products && (params.action === "findMany" || params.action === "findUnique")) {
    const convertDecimalToNumber = (obj: any) => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'object') {
        for (const key in obj) {
          if (obj[key] instanceof Decimal) {
            obj[key] = obj[key].toNumber();
          } else if (typeof obj[key] === 'object') {
            obj[key] = convertDecimalToNumber(obj[key]);
          }
        }
      }
      return obj;
    };

    if (Array.isArray(result)) {
      return result.map(convertDecimalToNumber);
    }
    return convertDecimalToNumber(result);
  }

  return result;
});

export default prisma;
