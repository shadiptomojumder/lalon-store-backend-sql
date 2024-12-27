import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/globalErrorHandler';
import routes from './routes';
import prisma from './shared/prisma';

const app: Application = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  }),
);

app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);
async function testDbConnection() {
  try {
    const result = await prisma.$connect(); // Test the connection
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

app.get('/test', async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Server working....!',
  });
});

testDbConnection();

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
