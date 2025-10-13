# Arachchi Spicy Management System

A comprehensive web application for managing spice business operations including orders, products, inventory, deliveries, and analytics.

## 🚀 Features

### Core Functionality
- **User Authentication**: Login/Register system with role-based access (Admin/User)
- **Order Management**: Create, read, update, delete orders with real-time tracking
- **Product Management**: Manage spice products with images and categories
- **Inventory Management**: Track stock levels and manage inventory
- **Delivery Management**: Smart delivery system with tracking and analytics
- **Customer Management**: Manage customer information and relationships
- **Supplier Management**: Handle supplier data and relationships
- **Feedback System**: Collect and manage customer feedback

### Advanced Features
- **Analytics Dashboard**: Order analytics with charts and insights (Admin only)
- **Real-time Notifications**: Toast notifications for user actions
- **Form Validation**: Comprehensive client-side and server-side validation
- **Responsive Design**: Mobile-friendly interface
- **File Upload**: Image upload for products
- **PDF Reports**: Generate order and delivery reports
- **Sri Lanka Map Integration**: Order tracking with map visualization

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface framework
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Toastify** - Notification system
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Session-based Authentication** - User authentication
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Arachchi_Spicy-Management-System/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd Arachchi_Spicy-Management-System
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the development servers**

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend Server:**
   ```bash
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 User Roles

### Admin Users
- Full access to all features
- Analytics dashboard
- User management
- System configuration

### Regular Users
- Order management
- Product viewing
- Delivery tracking
- Feedback submission

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/session` - Check session

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Analytics (Admin Only)
- `GET /api/analytics/sales-by-spice-type` - Sales analytics
- `GET /api/analytics/customer-order-frequency` - Customer analytics
- `GET /api/analytics/monthly-order-trend` - Monthly trends
- `GET /api/analytics/order-status-distribution` - Status distribution

## 🎨 UI Components

### Forms
- **OrderForm**: Create and edit orders with validation
- **ProductForm**: Manage products with image upload
- **DeliveryForm**: Smart delivery management
- **FeedbackForm**: Customer feedback collection

### Charts & Analytics
- **SimpleBarChart**: Bar chart component
- **SimplePieChart**: Pie chart component
- **SimpleLineChart**: Line chart component
- **SummaryCards**: Key metrics display

## 🔒 Security Features

- Session-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- File upload security

## 📊 Database Schema

### Key Models
- **User**: Authentication and user data
- **Order**: Order information and items
- **Product**: Product details and inventory
- **Delivery**: Delivery tracking and status
- **Customer**: Customer information
- **Supplier**: Supplier data
- **Feedback**: Customer feedback

## 🤝 Contributing

### Branch Structure
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Development Workflow
1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch to GitHub
4. Create Pull Request to `develop`
5. After review, merge to `develop`
6. Deploy from `main` branch

## 📝 Recent Updates

### v1.2.0 - Form & Analytics Improvements
- ✅ Fixed form labels display issues
- ✅ Enhanced error handling with toast notifications
- ✅ Added order analytics with charts
- ✅ Improved delivery edit/delete functionality
- ✅ Better user authentication flow

### v1.1.0 - Core Features
- ✅ Complete CRUD operations for all modules
- ✅ User authentication and authorization
- ✅ File upload functionality
- ✅ PDF report generation
- ✅ Responsive design implementation

## 🐛 Known Issues

- File uploads are stored locally (consider cloud storage for production)
- Session management could be enhanced with JWT tokens
- Database connection pooling could be optimized

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed with ❤️ for Arachchi Spices**