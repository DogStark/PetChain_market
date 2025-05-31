# PetChain Market - Veterinary Services Platform

A comprehensive NestJS application for veterinary services and pet care management, built with TypeScript, featuring strict type checking, comprehensive linting, and automated code formatting.

## Overview

PetChain Market is a professional veterinary services platform that provides a complete ecosystem for pet owners, veterinarians, and veterinary staff. The application includes modules for user management, authentication, pet profiles, medical records, emergency services, telemedicine, and shopping cart functionality.

## Features

- **User Management**: Complete user registration and profile management
- **Authentication**: Secure authentication system for users and staff
- **Pet Management**: Comprehensive pet profile and information system
- **Medical Records**: Digital medical record management for pets
- **Emergency Services**: Emergency veterinary service coordination
- **Telemedicine**: Remote veterinary consultation platform
- **Shopping Cart**: Integrated e-commerce for veterinary product
- **Staff Management**: Veterinary staff and clinic administration
- **Customer Pet Portal**: Dedicated customer interface for pet management
- **NestJS Framework**: Modern, scalable Node.js framework
- **TypeScript**: Strict type checking with enhanced compiler options
- **Code Quality**: ESLint with strict rules and Prettier formatting
- **Testing**: Unit and E2E testing with Jest
- **Development Experience**: Hot reload and debugging support
- **Professional Structure**: Organized codebase with best practices

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 16.x or higher)
- **npm** (version 7.x or higher)
- **Git** (for version control)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PetChain_market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm run start:dev
   ```

## Project Structure

```
src/
├── app.controller.ts          # Main application controller
├── app.controller.spec.ts     # Controller unit tests
├── app.module.ts             # Root application module
├── app.service.ts            # Main application service
├── main.ts                   # Application entry point
├── user/                     # User management module
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   ├── dto/
│   └── entities/
├── auth/                     # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   └── entities/
├── pet/                      # Pet management module
│   ├── pet.controller.ts
│   ├── pet.service.ts
│   ├── pet.module.ts
│   ├── dto/
│   └── entities/
├── medical_record/           # Medical records module
│   ├── medical_record.controller.ts
│   ├── medical_record.service.ts
│   ├── medical_record.module.ts
│   ├── dto/
│   └── entities/
├── shopping_cart/            # Shopping cart module
│   ├── shopping_cart.controller.ts
│   ├── shopping_cart.service.ts
│   ├── shopping_cart.module.ts
│   ├── dto/
│   └── entities/
├── veterinarian/            # Veterinarian services
│   └── staff/               # Staff management module
│       ├── staff.controller.ts
│       ├── staff.service.ts
│       ├── staff.module.ts
│       ├── dto/
│       └── entities/
├── customer/                # Customer services
│   └── pet/                 # Customer pet management
│       ├── pet.controller.ts
│       ├── pet.service.ts
│       ├── pet.module.ts
│       ├── dto/
│       └── entities/
├── emergency/               # Emergency services module
│   ├── emergency.controller.ts
│   ├── emergency.service.ts
│   ├── emergency.module.ts
│   ├── dto/
│   └── entities/
└── telemedicine/            # Telemedicine module
    ├── telemedicine.controller.ts
    ├── telemedicine.service.ts
    ├── telemedicine.module.ts
    ├── dto/
    └── entities/

test/
├── app.e2e-spec.ts          # End-to-end tests
└── jest-e2e.json            # E2E test configuration

Configuration Files:
├── .eslintrc.js             # ESLint configuration
├── .gitignore               # Git ignore rules
├── .prettierrc              # Prettier formatting rules
├── nest-cli.json            # NestJS CLI configuration
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── tsconfig.build.json      # Build-specific TypeScript config
```

## Available Scripts

### Development
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start development server with debugging
- `npm run start` - Start production server

### Building
- `npm run build` - Build the application for production

### Code Quality
- `npm run lint` - Run ESLint and fix issues automatically
- `npm run format` - Format code using Prettier

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

## Configuration Details

### TypeScript Configuration
The project uses strict TypeScript settings including:
- Strict null checks
- No implicit any
- Unused variable detection
- Enhanced property checking
- Path mapping for clean imports

### ESLint Rules
Comprehensive linting rules ensure code quality:
- Explicit return types required
- No unused variables
- Strict equality checks
- Import organization
- TypeScript-specific rules

### Prettier Formatting
Consistent code formatting with:
- Single quotes
- Trailing commas
- 80 character line width
- 2-space indentation

## API Endpoints

The application provides comprehensive REST API endpoints organized by modules:

### Core Endpoints
- `GET /api` - Returns welcome message
- `GET /api/health` - Health check endpoint

### User Management
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `POST /api/user` - Create new user
- `PATCH /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

### Authentication
- `GET /api/auth` - Get authentication status
- `POST /api/auth` - Authenticate user
- `PATCH /api/auth/:id` - Update authentication
- `DELETE /api/auth/:id` - Remove authentication

### Pet Management
- `GET /api/pet` - Get all pets
- `GET /api/pet/:id` - Get pet by ID
- `POST /api/pet` - Register new pet
- `PATCH /api/pet/:id` - Update pet information
- `DELETE /api/pet/:id` - Remove pet

### Medical Records
- `GET /api/medical-record` - Get all medical records
- `GET /api/medical-record/:id` - Get medical record by ID
- `POST /api/medical-record` - Create medical record
- `PATCH /api/medical-record/:id` - Update medical record
- `DELETE /api/medical-record/:id` - Delete medical record

### Shopping Cart
- `GET /api/shopping-cart` - Get cart contents
- `GET /api/shopping-cart/:id` - Get cart by ID
- `POST /api/shopping-cart` - Add item to cart
- `PATCH /api/shopping-cart/:id` - Update cart item
- `DELETE /api/shopping-cart/:id` - Remove cart item

### Veterinarian Staff
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get staff member by ID
- `POST /api/staff` - Add new staff member
- `PATCH /api/staff/:id` - Update staff information
- `DELETE /api/staff/:id` - Remove staff member

### Customer Pet Portal
- `GET /api/customer/pet` - Get customer pets
- `GET /api/customer/pet/:id` - Get customer pet by ID
- `POST /api/customer/pet` - Register customer pet
- `PATCH /api/customer/pet/:id` - Update customer pet
- `DELETE /api/customer/pet/:id` - Remove customer pet

### Emergency Services
- `GET /api/emergency` - Get emergency cases
- `GET /api/emergency/:id` - Get emergency case by ID
- `POST /api/emergency` - Create emergency case
- `PATCH /api/emergency/:id` - Update emergency case
- `DELETE /api/emergency/:id` - Close emergency case

### Telemedicine
- `GET /api/telemedicine` - Get telemedicine sessions
- `GET /api/telemedicine/:id` - Get session by ID
- `POST /api/telemedicine` - Create telemedicine session
- `PATCH /api/telemedicine/:id` - Update session
- `DELETE /api/telemedicine/:id` - End session

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules consistently
- Format code with Prettier before committing
- Write comprehensive tests for new features

### Git Workflow
- Create feature branches from main
- Use conventional commit messages
- Run tests before pushing
- Ensure all linting passes

### Testing Strategy
- Write unit tests for services and controllers
- Create E2E tests for API endpoints
- Maintain test coverage above 80%
- Use descriptive test names

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
PORT=3000
NODE_ENV=development
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Support
For containerized deployment, create a Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Troubleshooting

### Common Issues

1. **TypeScript compilation errors**
   - Check tsconfig.json configuration
   - Ensure all dependencies are installed
   - Verify import paths are correct

2. **ESLint errors**
   - Run `npm run lint` to auto-fix issues
   - Check .eslintrc.js configuration
   - Ensure code follows style guidelines

3. **Port already in use**
   - Change PORT in .env file
   - Kill existing processes on port 3000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.

## Support

For questions or issues, please refer to the NestJS documentation:
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Note**: PetChain Market is a comprehensive veterinary services platform designed for professional veterinary practice management, pet care coordination, and telemedicine services with enterprise-grade code quality standards.