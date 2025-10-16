import { Router } from 'express';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import blogRoutes from './blog.routes';
import counselorRoutes from './counselor.routes';
import bookingRoutes from './booking.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/blogs', blogRoutes);
router.use('/counselors', counselorRoutes);
router.use('/bookings', bookingRoutes);

export default router;
