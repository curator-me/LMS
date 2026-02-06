# LMS Project Structure

## Frontend Structure (client/LMS/src)

### 📁 api/
- `index.js` - API client configuration and endpoints

### 📁 components/
- `Navbar.jsx` - Navigation bar component
- `CourseCard.jsx` - Reusable course card with enrollment status
- `index.js` - Component exports

### 📁 pages/
- `Home.jsx` - Homepage with course listing (filters enrolled courses)
- `AuthPage.jsx` - Login/Signup page
- `CourseDetails.jsx` - Course detail view before purchase
- `CoursePlayer.jsx` - Post-purchase course overview with progress
- `LearningSession.jsx` - Individual material learning view
- `Dashboard.jsx` - User dashboard with stats, library, and certificates
- `index.js` - Page exports

### 📁 routes/
- (Reserved for future route configuration)

### 📄 Root Files
- `App.jsx` - Main application component with routing
- `main.jsx` - Application entry point
- `index.css` - Global styles

## Backend Structure (server/)

### 📁 controllers/
- `user.js` - User authentication, bank setup, activity tracking
- `course.js` - Course management, enrollment, progress tracking
- `bankManager.js` - Bank server integration

### 📁 routes/
- `user.js` - User-related routes
- `course.js` - Course-related routes

### 📁 database/
- `connectDb.js` - MongoDB connection and collections

## Key Features Implemented

### 1. Component Separation ✅
- All components split into logical files
- Organized folder structure (api, pages, components, routes)

### 2. Enrollment Filtering ✅
- Home page checks user's enrolled courses
- Shows "Enrolled" badge and "Continue Learning" button
- Filters out enrolled courses from purchase flow

### 3. Enhanced Dashboard Overview ✅
- **Available Balance** - Current bank balance
- **Total Courses** - Number of courses purchased
- **Weekly Streak** - Daily visit tracking with flame icon
- **Recent Activity** - Last 5 activities with timestamps

### 4. Activity Tracking ✅
- Login events tracked
- Weekly streak calculation (consecutive daily visits)
- Activity log stored in user document
- Displayed in dashboard overview

## API Endpoints

### User Routes
- `GET /user/` - Get all users
- `GET /user/stats/:userId` - Get user activity stats
- `GET /user/:id` - Get user by ID
- `POST /user/signup` - Register new user
- `POST /user/login` - Login (tracks activity)
- `POST /user/setup-bank` - Link bank account
- `GET /user/balance/:accountNumber` - Get bank balance

### Course Routes
- `GET /course/` - Get all courses
- `GET /course/:id` - Get course with materials
- `POST /course/upload` - Upload new course
- `POST /course/buy` - Purchase course
- `GET /course/my/:userId` - Get user's enrollments
- `GET /course/enrollment/:userId/:courseId` - Get specific enrollment
- `POST /course/finish-material` - Mark material as complete

## User Schema Updates
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  accountNumber: String,
  secret: String,
  activityLog: [{ action: String, timestamp: Date }],
  weeklyStreak: Number,
  lastVisit: Date,
  createdAt: Date
}
```

## Next Steps
- Add instructor dashboard for course management
- Implement certificate PDF generation
- Add course reviews and ratings
- Enhance activity tracking with more event types
