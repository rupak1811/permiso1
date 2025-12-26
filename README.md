# Permiso Platform

A comprehensive AI-powered permit management and automation system built with modern web technologies. The platform streamlines permit applications with intelligent automation, real-time tracking, and expert guidance for three distinct user roles: Users, Reviewers, and Administrators.

## 🚀 Features

### Core Functionality
- **AI-Powered Document Analysis**: Automatically extract and analyze permit documents using OpenAI integration
- **Real-time Notifications**: WebSocket-based notifications for status updates and comments
- **Multi-language Support**: i18next integration for English, Spanish, and Hindi
- **Voice Commands**: Speech-to-text functionality for hands-free navigation
- **Cost & Timeline Estimation**: AI-powered estimation tools for project planning
- **Document Management**: Secure file upload and management with Cloudinary integration
- **Payment Processing**: Stripe integration for seamless payment handling

### User Roles

#### 👤 User Portal
- **Landing Page**: Modern, animated homepage with feature showcase
- **Project Upload**: Drag-and-drop document upload with AI analysis
- **Dashboard**: Comprehensive project overview with real-time updates
- **AI Assistant**: Conversational AI for permit guidance and support
- **Cost Estimator**: Interactive tools for project cost and timeline estimation
- **Document Manager**: Centralized document storage and organization

#### 👀 Reviewer Portal
- **Review Dashboard**: Task management and workload overview
- **Workflow Management**: Kanban-style project review workflow
- **Review Interface**: Side-by-side document viewer and form editor
- **AI Validation**: Automated compliance checking and recommendations
- **Audit Trails**: Complete history of review actions and comments

#### ⚙️ Admin Console
- **Analytics Dashboard**: Comprehensive platform metrics and insights
- **User Management**: Complete user administration and role management
- **Project Oversight**: Global project monitoring and management
- **System Configuration**: Platform settings and workflow customization
- **Revenue Tracking**: Financial analytics and payment monitoring

## 🛠️ Tech Stack

### Frontend
- **React.js** (JavaScript, no TypeScript)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **Recharts** for data visualization
- **React Dropzone** for file uploads
- **Socket.io Client** for real-time communication
- **i18next** for internationalization
- **React Speech Kit** for voice commands

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for file storage
- **Stripe** for payments
- **OpenAI API** for AI features
- **Socket.io** for real-time communication
- **Nodemailer** for email notifications
- **Express Rate Limit** for API protection
- **Helmet** for security headers

### Design System
- **Glassmorphism UI**: Transparent panels with frosted-glass effects
- **Color Palette**: Deep blue, cyan, and purple gradients with neon accents
- **Typography**: Poppins font family with variable weights
- **Animations**: Smooth transitions, hover effects, and micro-interactions
- **Responsive Design**: Mobile-first approach with breakpoint optimization

## 📁 Project Structure

```
permiso-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── user/      # User portal pages
│   │   │   ├── reviewer/  # Reviewer portal pages
│   │   │   └── admin/     # Admin console pages
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── package.json
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Stripe account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/permiso-platform.git
   cd permiso-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/permiso
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   OPENAI_API_KEY=your_openai_api_key
   CLIENT_URL=http://localhost:3000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

### Production Deployment

#### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

#### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Configure network access and database user
3. Update MONGODB_URI in environment variables

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### File Upload
- `POST /api/uploads` - Upload file to Cloudinary
- `POST /api/uploads/project/:projectId` - Upload file to project
- `DELETE /api/uploads/project/:projectId/:documentId` - Delete document

### AI Features
- `POST /api/ai/analyze` - Analyze document with AI
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/estimate` - Get cost and timeline estimate
- `POST /api/ai/validate` - Validate form data

### Reviews
- `GET /api/reviews/pending` - Get pending reviews
- `POST /api/reviews/:projectId/approve` - Approve project
- `POST /api/reviews/:projectId/reject` - Reject project
- `POST /api/reviews/:projectId/comment` - Add review comment

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/projects` - Get all projects
- `GET /api/admin/analytics` - Get analytics data

## 🎨 UI Components

### Glassmorphism Design
The platform features a modern glassmorphism design with:
- Transparent panels with backdrop blur effects
- Subtle borders and shadows
- Gradient backgrounds and neon accents
- Smooth animations and transitions

### Key Components
- **GlassCard**: Base component for all panels
- **GlassButton**: Styled buttons with hover effects
- **GlassInput**: Form inputs with glass styling
- **PageWrapper**: Animated page transitions
- **LanguageSwitcher**: Multi-language support
- **AIAssistant**: Chat interface with voice support

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- Input validation and sanitization
- CORS configuration
- File upload restrictions and validation

## 📱 Responsive Design

The platform is fully responsive with breakpoints:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🌐 Internationalization

Supported languages:
- English (en)
- Spanish (es)
- Hindi (hi)

Language switching is available throughout the application with persistent user preferences.

## 🤖 AI Integration

### OpenAI Features
- Document analysis and data extraction
- Conversational AI assistant
- Form validation and recommendations
- Cost and timeline estimation

### Voice Commands
- Speech-to-text input
- Text-to-speech responses
- Voice navigation support

## 💳 Payment Integration

### Stripe Features
- Secure payment processing
- Payment intent creation
- Webhook handling
- Payment history tracking
- Refund support

## 📊 Analytics & Reporting

### Admin Analytics
- User growth tracking
- Revenue analytics
- Project status distribution
- Processing time metrics
- Performance insights

### Data Visualization
- Interactive charts with Recharts
- Real-time data updates
- Exportable reports
- Custom date ranges

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test
```

### Backend Testing
```bash
cd server
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Stripe for payment processing
- Cloudinary for file storage
- MongoDB for database services
- Vercel and Render for hosting
- All open-source contributors

## 📞 Support

For support, email support@permiso-platform.com or join our Slack channel.

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ User, Reviewer, and Admin portals
- ✅ AI integration
- ✅ Payment processing
- ✅ Real-time notifications

### Phase 2 (Q2 2024)
- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Workflow automation
- [ ] API marketplace

### Phase 3 (Q3 2024)
- [ ] Multi-tenant architecture
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] White-label solutions

---

**Built with ❤️ by the Permiso Platform team**
#   p r e m i s o  
 #   p e r m i s o 1  
 