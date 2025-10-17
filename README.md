# 🏪 ShopverseEcommerce - Complete E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC.svg)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.6.1-764ABC.svg)](https://redux-toolkit.js.org/)

A full-featured, modern e-commerce platform built with Next.js 15, TypeScript, and Supabase. Designed for businesses selling Shopverse and related products with advanced features like multi-language support, order management, reviews, flash sales, and comprehensive admin functionality.

## 🚀 Live Demo

- **Demo URL**: [https://demo.Shopversecommerce.com](https://demo.Shopversecommerce.com)
- **Admin Demo**: [https://demo.Shopversecommerce.com/admin](https://demo.Shopversecommerce.com/admin)

## ✨ Key Features

### 🌐 Multi-Language Support
- **English & Arabic** (العربية) with RTL support
- Dynamic language switching with persistent preferences
- Cookie-based language persistence (365 days)
- Comprehensive translation system with i18next

### 🎨 Modern UI/UX
- **Dark/Light Mode Toggle** with system preference detection
- **Custom Brown Color Scheme** (#573621) for brand consistency
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Smooth Animations** powered by Framer Motion

### 🛒 E-commerce Core Features
- **Product Catalog** with advanced filtering and search
- **Shopping Cart** with persistent storage
- **Secure Checkout** with order confirmation
- **Order Management** with tracking and status updates
- **Payment Integration** ready for multiple payment methods
- **Inventory Management** with stock tracking

### ⭐ Advanced Product Features
- **Customer Reviews & Ratings** (1-5 stars)
- **Flash Sales** with live countdown timers
- **Special Orders/Requests** for custom products
- **Product Categories** with enhanced filtering
- **Image Galleries** powered by Cloudinary

### 👥 User Roles & Permissions

#### 🛍️ **Client/Customer**
- Browse and search products
- Add items to cart and checkout
- Place orders with billing/shipping information
- View order history and track orders
- Submit product reviews and ratings
- Request special/custom orders
- Multi-language interface access

#### 👨‍💼 **Admin**
- Manage products (add, edit, delete)
- Process orders and update statuses
- Moderate customer reviews
- Handle special order requests
- View sales analytics and reports
- Manage categories and inventory
- Access admin dashboard

#### 👑 **Super Admin**
- **All Admin privileges** plus:
- Full order management system
- User role management
- System configuration
- Database oversight
- Financial reporting
- Advanced analytics dashboard
- Complete platform control

### 🛡️ Security & Performance
- **Row Level Security (RLS)** with Supabase
- **Role-based Access Control** (RBAC)
- **Secure Authentication** with email OTP
- **Input Validation** and sanitization
- **Optimized Performance** with Next.js 15
- **SEO Optimized** with metadata and structured data

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.3 with App Router
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **State Management**: Redux Toolkit 2.6.1
- **Animations**: Framer Motion 12.23.22
- **Icons**: Heroicons 1.0.6

### Backend & Database
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email OTP
- **Image Storage**: Cloudinary
- **Real-time**: Supabase Realtime (optional)

### Development Tools
- **Language Support**: i18next 25.5.3 + react-i18next 16.0.0
- **Form Handling**: React Hook Form (built-in)
- **HTTP Client**: Fetch API
- **Build Tool**: Next.js built-in bundler

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account and project
- Cloudinary account (for image management)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Shopverse-ecommerce.git
cd Shopverse-ecommerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for OTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
Run the database migrations in your Supabase SQL Editor:

1. **Core Tables**: `database-migrations.sql`
2. **Orders System**: `supabase_migrations/orders_migration.sql`
3. **Reviews System**: `reviews_table_migration.sql`
4. **Flash Sales**: `promo_banners_migration.sql`

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Build for Production
```bash
npm run build
npm start
```

## 📊 Database Schema

### Core Tables
- **products** - Product catalog with pricing, images, categories
- **categories** - Product categorization system
- **users** - Extended user profiles (Supabase Auth)
- **orders** - Order management with status tracking
- **order_items** - Individual items within orders
- **reviews** - Customer reviews and ratings
- **flash_sales** - Time-limited promotional campaigns
- **special_requests** - Custom order requests

### Key Relationships
- Products → Categories (Many-to-One)
- Orders → Users (Many-to-One)
- Order_Items → Orders & Products (Many-to-One)
- Reviews → Products & Users (Many-to-One)
- Flash_Sales → Products (One-to-One)

## 🎯 User Guide

### For Customers

#### Browsing Products
1. Navigate to the shop page
2. Use category filters in the sidebar
3. Apply price range and other filters
4. Search for specific products
5. View product details with images and reviews

#### Placing Orders
1. Add items to cart from product pages
2. Proceed to checkout
3. Fill in billing and shipping information
4. Select payment method
5. Add order notes if needed
6. Confirm and place order

#### Special Requests
1. Go to Special Orders page
2. Fill in product specifications
3. Upload reference images
4. Set budget and timeline
5. Submit for admin review

### For Administrators

#### Dashboard Access
- Navigate to `/admin/login`
- Enter super admin credentials
- Access full admin dashboard

#### Order Management
- View all orders in Orders tab
- Update order statuses (pending → processing → shipped → delivered)
- Update payment statuses
- View customer details and order history
- Handle special requests and quotes

#### Product Management
- Add new products with images and details
- Edit existing product information
- Manage product categories
- Monitor inventory levels

#### Review Moderation
- Approve or reject customer reviews
- Monitor review ratings and feedback
- Respond to customer inquiries

## 🔌 API Endpoints

### Orders
- `POST /api/create-order` - Create new order
- `GET /api/create-order` - Fetch orders (admin)

### Products
- `GET /api/products` - Fetch product catalog
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)

### Reviews
- `POST /api/reviews` - Submit product review
- `GET /api/reviews` - Fetch reviews (admin)
- `PUT /api/reviews/[id]` - Moderate review (admin)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## 🌟 Advanced Features

### Flash Sales System
- **Live Countdown Timers** with real-time updates
- **Stock Progress Bars** showing remaining inventory
- **Automatic Activation/Deactivation** based on dates
- **Discount Percentage Calculation** and display
- **Admin Management Interface** for creating campaigns

### Review System
- **5-Star Rating System** with visual indicators
- **Verified Purchase Badges** for authenticated reviews
- **Admin Moderation Queue** for review approval
- **Average Rating Calculations** with triggers
- **Rich Text Reviews** with titles and detailed feedback

### Multi-Language Implementation
- **Dynamic Translation Loading** based on user preference
- **RTL Support** for Arabic with proper text direction
- **Context-Aware Translations** for dates, numbers, and formatting
- **Fallback System** for missing translations

## 📱 Responsive Design

- **Mobile-First Approach** with Tailwind CSS
- **Breakpoint Optimization** for all screen sizes
- **Touch-Friendly Interface** for mobile users
- **Progressive Enhancement** for better performance

## 🔒 Security Features

### Authentication & Authorization
- **Email OTP Verification** for secure login
- **Role-Based Access Control** (Client/Admin/Super Admin)
- **Session Management** with secure cookies
- **Password Security** with proper hashing

### Data Protection
- **Input Sanitization** to prevent XSS attacks
- **SQL Injection Prevention** with parameterized queries
- **CSRF Protection** built into Next.js
- **Rate Limiting** on API endpoints

## 🚀 Performance Optimizations

- **Static Generation** for product pages where possible
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster initial load times
- **Caching Strategies** for API responses
- **Bundle Optimization** with tree shaking

## 📈 Analytics & Monitoring

- **Order Analytics** with revenue tracking
- **User Behavior Tracking** (optional)
- **Performance Monitoring** with Core Web Vitals
- **Error Tracking** and logging system

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript** for all new code
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Semantic Commit Messages** for clear history

### Testing
- Unit tests for components and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📋 Roadmap

### Phase 1 (Current) ✅
- [x] Multi-language support (EN/AR)
- [x] Dark/Light mode toggle
- [x] Custom branding and colors
- [x] Product catalog and filtering
- [x] Shopping cart and checkout
- [x] Order management system
- [x] Reviews and ratings
- [x] Flash sales system
- [x] Special orders functionality

### Phase 2 (Next)
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email marketing integration
- [ ] Inventory management system
- [ ] Multi-vendor marketplace features
- [ ] Advanced reporting and exports

### Phase 3 (Future)
- [ ] AI-powered product recommendations
- [ ] Blockchain integration for supply chain
- [ ] AR/VR product visualization
- [ ] International shipping and taxes
- [ ] Advanced customer support system
- [ ] IoT integration for smart inventory

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase** for the backend infrastructure
- **Tailwind CSS** for the utility-first styling
- **Redux Toolkit** for state management
- **Framer Motion** for smooth animations

## 📞 Support

For support and questions:
- **Email**: support@Shopversecommerce.com
- **Documentation**: [https://docs.Shopversecommerce.com](https://docs.Shopversecommerce.com)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/Shopverse-ecommerce/issues)

---

**Built with ❤️ for the pallet industry** | **Made in [Your Location]**

[![ShopverseEcommerce Logo](https://via.placeholder.com/200x50/573621/FFFFFF?text=ShopverseEcommerce)](https://Shopversecommerce.com)
