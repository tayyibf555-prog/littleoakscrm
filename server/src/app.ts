import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './modules/auth/auth.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import childrenRoutes from './modules/children/children.routes';
import parentsRoutes from './modules/parents/parents.routes';
import staffRoutes from './modules/staff/staff.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import diaryRoutes from './modules/daily-diary/daily-diary.routes';
import incidentsRoutes from './modules/incidents/incidents.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import communicationsRoutes from './modules/communications/communications.routes';
import eyfsRoutes from './modules/eyfs/eyfs.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import invoicingRoutes from './modules/invoicing/invoicing.routes';
import socialMediaRoutes from './modules/social-media/social-media.routes';
import documentsRoutes from './modules/documents/documents.routes';
import gdprRoutes from './modules/gdpr/gdpr.routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later' },
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/children', childrenRoutes);
app.use('/api/v1/parents', parentsRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/diary', diaryRoutes);
app.use('/api/v1/incidents', incidentsRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/communications', communicationsRoutes);
app.use('/api/v1/eyfs', eyfsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/billing', invoicingRoutes);
app.use('/api/v1/social-media', socialMediaRoutes);
app.use('/api/v1/documents', documentsRoutes);
app.use('/api/v1/gdpr', gdprRoutes);

// Error handling
app.use(errorHandler);

export default app;
