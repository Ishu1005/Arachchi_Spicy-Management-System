# 🌶️ Arachchi Spicy Management System

A comprehensive full-stack web application for managing spice products, orders, deliveries, and inventory with smart analytics and AI-powered features.

## 🚀 Features

### 📦 Product Management
- **Smart Product Catalog**: Add, edit, and manage spice products
- **Quantity Types**: Support for Kg/g measurements
- **Category Management**: Whole, Powder, Organic spices
- **Image Upload**: Product image management with preview
- **Quality Assessment**: AI-powered quality scoring based on inventory

### 🛒 Order Management
- **Order Processing**: Complete order lifecycle management
- **Customer Management**: Customer information and order history
- **Payment Tracking**: Payment status monitoring
- **Order Analytics**: Comprehensive order reporting

### 🚚 Delivery Management
- **Smart Delivery System**: AI-powered delivery optimization
- **Route Optimization**: Automatic route planning
- **Weather & Traffic Integration**: Real-time delivery conditions
- **Multiple Delivery Methods**: Standard, Express, Pickup, Courier, Eco-friendly
- **Driver Management**: Agent assignment and tracking
- **Comprehensive Reporting**: Detailed PDF/CSV reports with 20+ data fields

### 📊 Analytics & Reporting
- **Smart Dashboard**: Real-time analytics and insights
- **Export Capabilities**: PDF and CSV report generation
- **Performance Metrics**: Success rates, delivery times, quality scores
- **Visual Charts**: Interactive data visualization

### 🔐 User Management
- **Role-based Access**: Admin and User roles
- **Authentication**: Secure login/logout system
- **Session Management**: Persistent user sessions

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **React Toastify** - Notification system
- **jsPDF** - PDF generation
- **Papa Parse** - CSV handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Multer** - File upload handling
- **JWT** - Authentication tokens

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ishu1005/Arachchi_Spicy-Management-System.git
cd Arachchi_Spicy-Management-System
```

### 2. Install Dependencies

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arachchi_spicy_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Client Environment
Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Database Setup

#### Start MongoDB
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

#### Create Database
The application will automatically create the database when you first run it.

### 5. Run the Application

#### Start the Server
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

#### Start the Client (in a new terminal)
```bash
cd client
npm start
```
The client will run on `http://localhost:3000`

## 🔧 Development Commands

### Server Commands
```bash
cd server

# Start development server
npm start

# Start with nodemon (auto-restart)
npm run dev

# Run tests
npm test
```

### Client Commands
```bash
cd client

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

## 📁 Project Structure

```
Arachchi_Spicy-Management-System/
├── client/                 # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   ├── package.json
│   └── README.md
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads
│   ├── server.js           # Main server file
│   └── package.json
├── package.json
└── README.md
```

## 🔐 Default Admin Account

For initial setup, you can create an admin account through the registration page:
- **Role**: Admin
- **Permissions**: Full system access including smart analytics dashboard

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Deliveries
- `GET /api/delivery` - Get all deliveries
- `POST /api/delivery` - Create delivery
- `PUT /api/delivery/:id` - Update delivery
- `DELETE /api/delivery/:id` - Delete delivery

## 🚀 Deployment

### Production Build

#### Build Client
```bash
cd client
npm run build
```

#### Deploy Server
```bash
cd server
npm install --production
npm start
```

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

## 🤝 Team Collaboration

### Git Workflow

#### For Team Members - Getting Started
```bash
# Clone the repository
git clone https://github.com/Ishu1005/Arachchi_Spicy-Management-System.git
cd Arachchi_Spicy-Management-System

# Create your own branch
git checkout -b your-name/feature-description

# Make your changes and commit
git add .
git commit -m "Your commit message"

# Push your branch
git push origin your-name/feature-description

# Create a Pull Request on GitHub
```

#### Pull Latest Changes
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Switch back to your branch
git checkout your-name/feature-description

# Merge latest changes
git merge main
```

### Branch Naming Convention
- `feature/your-name/description` - For new features
- `bugfix/your-name/description` - For bug fixes
- `hotfix/your-name/description` - For urgent fixes

### Commit Message Format
```
type(scope): description

Examples:
feat(product): add quantity type selection
fix(delivery): resolve PDF generation issue
docs(readme): update setup instructions
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 5000
npx kill-port 5000

# Kill process using port 3000
npx kill-port 3000
```

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB service
sudo systemctl restart mongod  # Linux
net restart MongoDB            # Windows
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Issues
```bash
# Clear build cache
cd client
rm -rf build
npm run build
```

## 📞 Support

For any issues or questions:
1. Check the troubleshooting section above
2. Create an issue on GitHub
3. Contact the development team

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Customer mobile app

---

**Happy Coding! 🌶️**

Made with ❤️ by the Arachchi Spicy Management Team