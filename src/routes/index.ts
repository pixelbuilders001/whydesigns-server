import { Router } from 'express';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import blogRoutes from './blog.routes';
import counselorRoutes from './counselor.routes';
import bookingRoutes from './booking.routes';
import materialRoutes from './material.routes';
import testimonialRoutes from './testimonial.routes';
import reelRoutes from './reel.routes';

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
router.use('/materials', materialRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/reels', reelRoutes);

export default router;
