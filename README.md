# Career Path Visualization System

A web application for visualizing career opportunities within a company, allowing:

* Employees to see available career paths
* HR to manage roles, skills, and transitions
* Visual representation of career growth as a graph

---

## Technology Stack

### Backend (NestJS)
* **NestJS** - Progressive Node.js framework
* **TypeScript** - Typed JavaScript
* **Prisma ORM** - Next-generation ORM
* **PostgreSQL** - Relational database
* **JWT / Passport** - Authentication and authorization
* **class-validator** - Validation decorators
* **Swagger (OpenAPI)** - API documentation

### Frontend
* **React** - UI library
* **TypeScript** - Typed JavaScript
* **Feature-Sliced Design (FSD)** - Frontend architecture methodology
* **React Flow** - Node-based graph visualization
* **Axios** - HTTP client
* **Tailwind CSS** - Utility-first CSS framework
* **React Hook Form + Zod** - Form validation

---

## Functional Roles

| Role     | Description                      |
| -------- | -------------------------------- |
| Employee | View career paths                |
| HR       | Manage positions and skills      |
| Admin    | Full access                      |

---

## Project Structure

```
.
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── config/         # Configuration
│   └── prisma/            # Database schema and migrations
│
└── client/                # React frontend
    └── src/
        ├── app/           # Application setup
        ├── widgets/       # Complex UI components
        ├── features/      # Business features
        ├── entities/      # Business entities
        └── shared/        # Shared utilities
```

---

## Installation and Setup

### Prerequisites
* Node.js (v18 or higher)
* Docker and Docker Compose
* npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd Thesis
```

### 2. Start the database

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following configuration:
- **User**: `career_user`
- **Password**: `career_password`
- **Database**: `career_paths`
- **Port**: `5432`

### 3. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

**Note:** `--legacy-peer-deps` is used because `@nestjs/swagger@8.x` does not officially support NestJS 11 in peer dependencies, but works correctly in practice.

### 4. Configure environment variables:

```bash
cp .env.example .env
```

The `.env` file is already configured to work with the Docker container:

```
DATABASE_URL="postgresql://career_user:career_password@localhost:5432/career_paths?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

If you want to change the database connection parameters, edit the `.env` file and `docker-compose.yml`.

### 5. Run Prisma migrations:

```bash
npm run prisma:migrate
```

### 6. Generate Prisma Client:

```bash
npm run prisma:generate
```

### 7. Run the seed script to initialize initial data:

```bash
npm run prisma:seed
```

This will create:
- 3 users (admin@company.com, hr@company.com, employee@company.com) with password `password123`
- 7 positions (Junior/Middle/Senior Developer, Tech Lead, Junior/Middle Designer, Project Manager)
- 6 skills (TypeScript, React, Node.js, Leadership, Figma, Agile)
- 7 transitions between positions

### 8. Start the server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api`

---

### 9. Frontend Setup

Open a new terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## API Endpoints

### Authentication
* `POST /auth/register` - Register a new user
* `POST /auth/login` - Login user

### Users
* `GET /users/profile` - Get current user profile
* `PUT /users/profile` - Update current user profile
* `PUT /users/profile/skills` - Update user skills
* `GET /users/profile/skills` - Get user skills
* `PUT /users/:id/position` - Update user position (HR/Admin only)

### Positions
* `GET /positions` - Get all positions
* `GET /positions/:id` - Get position by id
* `POST /positions` - Create position (HR/Admin only)
* `PATCH /positions/:id` - Update position (HR/Admin only)
* `DELETE /positions/:id` - Delete position (HR/Admin only)

### Skills
* `GET /skills` - Get all skills
* `GET /skills/:id` - Get skill by id
* `POST /skills` - Create skill (HR/Admin only)
* `PATCH /skills/:id` - Update skill (HR/Admin only)
* `DELETE /skills/:id` - Delete skill (HR/Admin only)

### Transitions
* `GET /transitions` - Get all transitions
* `GET /transitions/:id` - Get transition by id
* `POST /transitions` - Create transition (HR/Admin only)
* `PATCH /transitions/:id` - Update transition (HR/Admin only)
* `DELETE /transitions/:id` - Delete transition (HR/Admin only)

### Career Paths
* `GET /career-paths` - Get career graph
* `GET /career-paths/from/:positionId` - Get career paths from specific position

---

## Features

### Career Path Visualization
* Interactive graph showing all positions and transitions
* Color-coded transitions:
  - **Green** - Vertical (promotion within department)
  - **Blue** - Horizontal (transfer between departments at same level)
  - **Orange** - Change (career path change)
* Recommended path highlighting:
  - **Green thick line** - Recommended transition (user has all required skills)
  - **Yellow dashed line** - Partially available (user has some required skills)
  - **Normal line** - Not available (user lacks required skills)

### User Skills Management
* Users can add and manage their skills in the profile
* System automatically highlights available career paths based on user skills
* Shows missing skills for each transition

### Admin Panel
* HR and Admin can manage:
  - Positions (create, update, delete)
  - Skills (create, update, delete)
  - Transitions (create, update, delete)
* Full CRUD operations with validation

---

## Database Schema

### Models

**User**
* id, email, password, role, positionId
* Relations: position, skills (UserSkill)

**Position**
* id, title, level, department
* Relations: users, transitions (from/to)

**Skill**
* id, name, category
* Relations: transitions, users (UserSkill)

**UserSkill**
* id, userId, skillId
* Unique constraint on [userId, skillId]

**Transition**
* id, type, fromPositionId, toPositionId
* Relations: fromPosition, toPosition, requiredSkills

### Enums

**Role**: EMPLOYEE, HR, ADMIN

**TransitionType**: VERTICAL, HORIZONTAL, CHANGE

---

## Development

### Backend Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database

# Testing
npm run test
npm run test:watch
npm run test:cov
```

### Frontend Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview

# Linting
npm run lint
```

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://career_user:career_password@localhost:5432/career_paths?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### Frontend

No environment variables required for development.

---

## Testing

### Default Test Accounts

After running the seed script, you can use:

* **Admin**: `admin@company.com` / `password123`
* **HR**: `hr@company.com` / `password123`
* **Employee**: `employee@company.com` / `password123`

---

## Troubleshooting

### Database Connection Issues

1. Ensure Docker container is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify `.env` file has correct credentials matching `docker-compose.yml`

### Port Already in Use

If port 3000 or 5173 is already in use, change it in:
* Backend: `.env` file (`PORT=3000`)
* Frontend: `vite.config.ts` (default port 5173)

### Prisma Migration Issues

If migrations fail:
1. Reset the database (⚠️ **WARNING**: This will delete all data):
   ```bash
   npm run prisma:migrate reset
   ```

2. Or manually fix the migration and run:
   ```bash
   npm run prisma:migrate dev
   ```

---

## License

UNLICENSED

---

## CI/CD

The project includes GitHub Actions workflows for automated testing and deployment:

### Backend Workflow (`.github/workflows/backend.yml`)
- Runs on push/PR to `main` and `develop` branches
- Tests with PostgreSQL service
- Runs linting and tests
- Builds Docker image on main branch push

### Frontend Workflow (`.github/workflows/frontend.yml`)
- Runs on push/PR to `main` and `develop` branches
- Runs linting and type checking
- Builds production bundle
- Runs Lighthouse CI for performance checks

## Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Build Images Manually

**Backend:**
```bash
cd server
docker build -t career-paths-backend .
```

**Frontend:**
```bash
cd client
docker build -t career-paths-frontend .
```

## Performance Optimizations

### Backend
- Multi-stage Docker builds for smaller images
- Production dependencies only in final image
- Non-root user for security
- Health checks configured
- Prisma Client generation optimized

### Frontend
- Code splitting with manual chunks
- Gzip compression in Nginx
- Static asset caching (1 year)
- React Router support in Nginx
- Production build optimizations

## Contributing

This is a thesis project. For questions or issues, please contact the project maintainer.
