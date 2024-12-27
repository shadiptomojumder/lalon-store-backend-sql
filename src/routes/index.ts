import express from 'express';

import { userRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { productRoutes } from '../modules/product/product.route';


const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/user',
    route: userRoutes,
  },
  {

    path: '/auth',
    route: AuthRoutes,
    
  },
  {
    path:"/product",
    route: productRoutes,
  }

];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
