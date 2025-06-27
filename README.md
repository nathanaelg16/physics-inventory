# Physics Inventory

A comprehensive desktop application for managing the Andrews University Physics Department inventory, equipment tracking, and laboratory resource allocation built with modern web technologies.

## 🔬 Overview

This desktop application provides a complete solution for the Andrews University Physics Department to manage their equipment inventory, track laboratory resources, and maintain detailed records of all departmental assets. The system offers intuitive interfaces for inventory management, equipment maintenance tracking, and resource allocation across multiple laboratory courses.

## ✨ Features

### Asset Management
- **Comprehensive Asset Database**: Track detailed information including brand, model, serial numbers, purchase dates, and financial records
- **Advanced Search**: Full-text search across equipment names, keywords, brands, models, and vendors
- **Visual Documentation**: Store multiple images and receipt copies for each equipment item
- **Missing Item Tracking**: Monitor and report missing equipment with detailed logging
- **Maintenance Scheduling**: Track calibration dates, repair status, and maintenance history

### Laboratory Management
- **Course Integration**: Manage laboratory courses with detailed equipment requirements
- **Resource Allocation**: Track equipment distribution across lab stations
- **Consumable Management**: Monitor consumable supplies and quantities

### Data Management
- **Group and Set Organization**: Organize equipment into logical groups and sets
- **User Access Control**: Multi-level user permissions and access management
- **Audit Logging**: Comprehensive logging of all system activities
- **Manual Storage**: Digital and physical manual tracking

## 🛠️ Technology Stack

### Frontend
- **React** - Modern UI framework for responsive interfaces
- **TypeScript** - Type-safe JavaScript for robust development
- **CSS3** - Styled for desktop optimization

### Backend
- **Go** - High-performance backend API
- **MySQL** - Reliable relational database with full-text search

### Desktop Framework
- **Wails** - Go + Web frontend for native desktop applications
- Cross-platform compatibility (Windows, macOS, Linux)

## 📋 Prerequisites

- **Go** 1.24.2 or higher
- **Node.js** 22.14.x or higher
- **npm** package manager
- **MySQL** 8.0.41
- **Wails** framework installed

## 🚀 Installation (For Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/nathanaelg16/physics-inventory.git
   cd physics-inventory
   ```

2. **Install Wails**
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE physics_inventory;
   
   # Import the database schema
   mysql -u root -p physics_inventory < database/physics_inventory_ddl.sql
   ```

5. **Configure DB Host**
   ```Go
   // Edit `DBHost` variable in `app.go`
   const DBHost = "localhost:3306"
   ```

6. **Build and run the application**
   ```bash
   # Development mode
   wails dev
   
   # Production build
   wails build
   ```

## 💻 Usage

### Getting Started
1. Launch the application
2. Login with your database credentials
3. Begin adding equipment and location data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Planned Features
- [ ] Advanced reporting and analytics dashboard
- [ ] Equipment reservation system
- [ ] Mobile companion app for equipment scanning
- [ ] Automated maintenance reminders

## 📸 Screenshots

*Screenshots will be added as the application development progresses.*

## 🙏 Acknowledgments

- Andrews University Physics Department for requirements and testing
- Wails framework community for excellent desktop app foundation

---

**Built with ❤️ for the Andrews University Physics Department**
