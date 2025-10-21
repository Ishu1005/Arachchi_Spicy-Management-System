# 🚀 Quick Setup Guide for Team Members

## 📋 Prerequisites
Make sure you have these installed:
- **Node.js** (Download from: https://nodejs.org/)
- **MongoDB** (Download from: https://www.mongodb.com/try/download/community)
- **Git** (Download from: https://git-scm.com/)

## 🔧 Step-by-Step Setup

### 1. Clone the Project
```bash
git clone https://github.com/Ishu1005/Arachchi_Spicy-Management-System.git
cd Arachchi_Spicy-Management-System
```

### 2. Install Dependencies

**Install Server Dependencies:**
```bash
cd server
npm install
```

**Install Client Dependencies:**
```bash
cd ../client
npm install
```

### 3. Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```
✅ Server will run on: http://localhost:5000

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```
✅ Client will run on: http://localhost:3000

### 5. Access the Application
Open your browser and go to: **http://localhost:3000**

## 🔄 Getting Latest Updates

When you want to get the latest changes from the team:

```bash
# Go to project directory
cd Arachchi_Spicy-Management-System

# Pull latest changes
git pull origin main

# Restart the application
# Stop both terminals (Ctrl+C)
# Then restart using steps 4 above
```

## 🐛 Common Issues & Solutions

### Issue: Port already in use
**Solution:**
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000
npx kill-port 5000
```

### Issue: MongoDB not starting
**Solution:**
```bash
# Windows
net restart MongoDB

# Mac/Linux
sudo systemctl restart mongod
```

### Issue: npm install fails
**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 Application Features

### 🌶️ Product Management
- Add/edit spice products
- Upload product images
- Set quantity types (Kg/g)
- Category management

### 🛒 Order Management
- Process customer orders
- Track order status
- Manage customer information

### 🚚 Delivery Management
- Smart delivery system
- Route optimization
- Driver assignment
- Comprehensive reporting

### 📊 Analytics Dashboard
- Real-time statistics
- Export reports (PDF/CSV)
- Performance metrics

## 🔐 Login Information

1. Go to: http://localhost:3000
2. Click "Register" to create your account
3. Choose "Admin" role for full access
4. Login with your credentials

## 📞 Need Help?

If you encounter any issues:
1. Check this troubleshooting guide
2. Ask your team members
3. Create an issue on GitHub

---

**Happy Coding! 🌶️**
