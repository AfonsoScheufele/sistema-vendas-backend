# AXORA Sales Management System - Backend

Complete backend for sales management system built with NestJS, TypeORM, and PostgreSQL.

## Features

### Product Management
- Complete CRUD with inventory control
- Product categorization and tagging
- Minimum stock level control
- Price management (sale and cost)
- Barcode and SKU support
- Product dimensions and weight

### Customer Management
- Complete customer registration (individual and corporate)
- Addresses and contact information
- Sales history per customer
- Customer segmentation by type

### Sales System
- Sales processing with items
- Automatic calculation of totals and discounts
- Commission control
- Multiple payment methods
- Sales reports by salesperson

### Order Management
- Complete order system
- Status control
- Delivery management
- Order history

### Executive Dashboard
- Real-time metrics
- Monthly and daily sales
- Best-selling products
- Distribution by categories
- Insights and alerts

### Authentication & Authorization
- JWT Authentication
- Role-based access control (Admin, Salesperson, User)
- Password recovery
- User profiles

### Notification System
- Real-time notifications
- Low stock alerts
- Sales notifications

### Additional Modules
- **CRM**: Leads and opportunities
- **Quotes**: Quote system
- **Suppliers**: Supplier management
- **Quotations**: Quotation system
- **Inventory**: Stock movement control
- **Financial**: Financial control
- **Tax**: Tax invoices
- **Logistics**: Carriers and shipping

## Technologies

### Backend Core
- **NestJS** - Robust Node.js framework
- **TypeScript** - Static typing
- **TypeORM** - Database ORM
- **PostgreSQL** - Main database

### Authentication & Security
- **JWT** - JSON Web Tokens
- **Passport** - Authentication strategies
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

### Validation & DTOs
- **class-validator** - Data validation
- **class-transformer** - Object transformation

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/AfonsoScheufele/sistema-vendas-backend.git
cd sistema-vendas-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your settings
```

### 4. Run company seed (optional)
```bash
npm run seed:empresa
```

## Running the Project

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start:prod
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user
- `GET /auth/me` - Logged-in user profile
- `POST /auth/refresh` - Renew token
- `POST /auth/logout` - Logout
- `POST /auth/recuperar-senha` - Request password recovery
- `POST /auth/redefinir-senha` - Reset password
- `POST /auth/change-password` - Change password

### Products
- `GET /produtos` - List products (with filters)
- `GET /produtos/categorias` - List categories
- `GET /produtos/estoque-baixo` - Low stock products
- `GET /produtos/stats` - Product statistics
- `GET /produtos/:id` - Get product by ID
- `POST /produtos` - Create product
- `PUT /produtos/:id` - Update product
- `PATCH /produtos/:id/estoque` - Update stock
- `DELETE /produtos/:id` - Delete product
- `GET /api/produtos` - List products (compatibility)

### Customers
- `GET /clientes` - List customers (with filters)
- `GET /clientes/stats` - Customer statistics
- `GET /clientes/tipos` - Customer types
- `GET /clientes/novos` - New customers by period
- `GET /clientes/:id` - Get customer by ID
- `GET /clientes/:id/vendas` - Customer sales
- `POST /clientes` - Create customer
- `PATCH /clientes/:id` - Update customer
- `DELETE /clientes/:id` - Delete customer
- `GET /api/clientes` - List customers (compatibility)

### Sales
- `GET /vendas` - List sales (with filters)
- `GET /vendas/stats` - Sales statistics
- `GET /vendas/vendedores` - Salesperson list
- `GET /vendas/comissoes` - Commission report
- `GET /vendas/relatorio` - Sales report
- `GET /vendas/:id` - Get sale by ID
- `POST /vendas` - Create sale
- `DELETE /vendas/:id` - Delete sale
- `GET /api/vendas` - List sales (compatibility)

### Orders
- `GET /pedidos` - List orders (with filters)
- `GET /pedidos/stats` - Order statistics
- `GET /pedidos/:id` - Get order by ID
- `POST /pedidos` - Create order
- `PATCH /pedidos/:id` - Update order
- `DELETE /pedidos/:id` - Delete order
- `GET /api/pedidos` - List orders (compatibility)

### Dashboard
- `GET /dashboard/stats` - General statistics
- `GET /dashboard/vendas-mensais` - Monthly sales
- `GET /dashboard/produtos-mais-vendidos` - Best-selling products
- `GET /dashboard/faturamento-diario` - Daily revenue
- `GET /dashboard/distribuicao-categorias` - Category distribution
- `GET /dashboard/insights` - Insights and alerts
- `GET /dashboard/resumo` - Executive summary
- `GET /dashboard/metas` - Goals and objectives
- `GET /dashboard/alertas` - System alerts
- `GET /api/dashboard/*` - Compatibility endpoints

### Notifications
- `GET /notifications` - List user notifications
- `GET /notifications/unread-count` - Unread count
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications` - Create notification

### Additional Modules
- **CRM**: `/crm/leads`, `/crm/oportunidades`, `/crm/campanhas-email`
- **Quotes**: `/orcamentos`
- **Suppliers**: `/fornecedores`
- **Quotations**: `/cotacoes`
- **Inventory**: `/estoque`
- **Financial**: `/financeiro`
- **Tax**: `/fiscal`
- **Logistics**: `/logistica`

## Environment Configuration

### Environment Variables (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database (Supabase)
DB_HOST=db.ejiyizaxmdfqqwpmchxe.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=postgres

# JWT
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run start:dev        # Start with watch mode
npm run start:debug      # Start in debug mode

# Production
npm run build           # Build the project
npm run start:prod      # Start in production

# Database
npm run seed:empresa    # Company seed (optional)

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

## Frontend Integration

This backend is fully compatible with the frontend at:
- [sistema-vendas-frontend](https://github.com/AfonsoScheufele/sistema-vendas-frontend)

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Create React App)
- `http://localhost:8080` (Vue.js)

## Scheduled Tasks

The system includes automated scheduled tasks that run daily:

- **Low Stock Check** (8:00 AM): Verifies products with low stock and sends notifications
- **Payment Due Date Check** (9:00 AM): Checks for overdue and upcoming payments
- **Quote Expiration** (Midnight): Automatically expires quotes past their validity date
- **Order Status Update** (10:00 AM): Updates order status based on shipping and delivery dates

## Login Credentials

Use the following credentials to log in:
- **Email**: `admin@sistema.com`
- **Password**: `password`

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Support

For support and questions:
- Email: suporte@axora.com
- Issues: [GitHub Issues](https://github.com/AfonsoScheufele/sistema-vendas-backend/issues)

---

**Developed by the AXORA team**
