# English-Finnish Language Learning App

Full-stack web application for learning English vocabulary with Finnish translations using spaced repetition flashcards.

## Features

- **User Authentication** - Secure registration and login with JWT
- **Spaced Repetition Learning** - Optimized review scheduling using SM-2 algorithm
- **Flashcard Practice** - Interactive flashcard system with instant feedback
- **Progress Tracking** - Detailed statistics and learning analytics
- **Dictionary Browser** - Browse and search 2000+ word translations
- **Responsive Design** - Modern UI built with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### DevOps
- Docker & Docker Compose
- PostgreSQL 16

## Project Structure

```
language-learning/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrations/     # Database schema
│   │   │   └── seeds/          # Seed data (generated)
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth middleware
│   │   └── types/              # TypeScript types
│   └── scripts/                # Data fetching scripts
├── frontend/
│   └── src/
│       ├── pages/              # Page components
│       ├── services/           # API client
│       └── types/              # TypeScript types
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker Desktop installed
- Node.js 20+ (for local development)
- Git

### Installation & Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd Kielenopiskelusovellus
```

2. **Create environment file for backend**

```bash
cd backend
cp .env.example .env
```

Edit `.env` if needed (default values work with Docker Compose).

3. **Start the application with Docker Compose**

```bash
# From project root
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173

4. **Run database migrations** (in a new terminal)

```bash
docker exec -it language_learning_backend npm run migrate
```

5. **Fetch and seed data**

```bash
# Fetch translation data from GitHub
docker exec -it language_learning_backend npm run fetch-data

# Seed the database
docker exec -it language_learning_backend npm run seed
```

6. **Open the application**

Navigate to http://localhost:5173 in your browser.

## Development Workflow

### Running Without Docker (Local Development)

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Make sure PostgreSQL is running locally and update `DATABASE_URL` in `.env`.

### Database Migrations

Create new migration:
```bash
# Create SQL file in backend/src/db/migrations/
# Name it with incrementing number: 007_your_migration.sql
```

Run migrations:
```bash
docker exec -it language_learning_backend npm run migrate
# or locally: cd backend && npm run migrate
```

### Data Management

Fetch fresh data from GitHub:
```bash
docker exec -it language_learning_backend npm run fetch-data
```

Seed database:
```bash
docker exec -it language_learning_backend npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Words
- `GET /api/words` - Get all words (paginated)
- `GET /api/words/:id` - Get word with example sentences
- `GET /api/words/search/query?q=` - Search words
- `GET /api/words/random/card` - Get random word for practice
- `GET /api/words/review/due` - Get words due for review

### Progress
- `POST /api/progress` - Submit practice result
- `GET /api/progress/stats` - Get user statistics
- `GET /api/progress/dashboard` - Get dashboard data

## Spaced Repetition Algorithm

The app uses a simplified SM-2 (SuperMemo 2) algorithm:

- **Correct Answer**: Interval multiplied by ease factor, ease factor slightly increased
- **Incorrect Answer**: Interval reset to 1 day, ease factor decreased
- **Learned Word**: 5+ correct answers with 80%+ accuracy

## Data Source

Translation data from: [EkBass/fin-eng-translations-set](https://github.com/EkBass/fin-eng-translations-set)

- 36,000+ unique Finnish words
- 20,000+ sentence translations
- Manually reviewed and curated

## Deployment

### Railway (Recommended)

1. Push code to GitHub
2. Connect Railway to your repository
3. Add PostgreSQL database in Railway
4. Set environment variables
5. Deploy!

### Environment Variables (Production)

```
DATABASE_URL=<your-postgresql-url>
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
```

## Future Enhancements

- [ ] Audio pronunciation (TTS)
- [ ] Sentence practice mode
- [ ] Word categories/tags
- [ ] Detailed progress charts
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Social features (compete with friends)
- [ ] Multi-language support (Swedish, German, etc.)

## License

MIT

## Contributing

Contributions welcome! Please open an issue first to discuss proposed changes.

## Troubleshooting

**Database connection issues:**
```bash
docker-compose down
docker-compose up --build
```

**Reset database:**
```bash
docker exec -it language_learning_db psql -U user -d language_learning -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -it language_learning_backend npm run migrate
docker exec -it language_learning_backend npm run seed
```

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Contact

For questions or support, please open an issue on GitHub.
