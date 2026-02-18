const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const { swaggerUi, specs } = require('./config/swagger');

// Import seeding functions
const seedRoles = require('./seed/roles');
const seedPlans = require('./seed/plans');
const seedUiModes = require('./seed/uiModes');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const calendarRoutes = require('./routes/calendarRoute');
const chatlogRoutes = require('./routes/chatlogRoutes');
const discountRoutes = require('./routes/discountRoutes');
const gamificationRoutes = require('./routes/gamificationRoute');
const messageRoutes = require('./routes/messageRoute');
const motivationRoutes = require('./routes/motivationRoute');
const notificationRoutes = require('./routes/notificationRoute');
const planRoutes = require('./routes/planRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const reportRoutes = require('./routes/reportRoutes');
const roleRoutes = require('./routes/roleRoutes');
const routineRoutes = require('./routes/routineRoutes');
const stripeRoutes = require('./routes/stripeRoute');
const taskRoutes = require('./routes/taskRoutes');
const templateRoutes = require('./routes/templateRoute');
const therapistRoutes = require('./routes/therapistRoute');
const uiModeRoutes = require('./routes/uiModeRoutes');
const userAssignmentRoutes = require('./routes/userAssignmentRoutes');

dotenv.config();
const app = express();
connectDB();

// Seed database with initial data
const seedDatabase = async () => {
  try {
    await seedRoles();
    await seedPlans();
    await seedUiModes();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

// Run seeding
seedDatabase();

app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NestifyND API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/chatlogs', chatlogRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/motivation', motivationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/ui-modes', uiModeRoutes);
app.use('/api/user-assignments', userAssignmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
