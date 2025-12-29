# Quick Start Guide

Get your language learning app running in 5 minutes!

## 🚀 Fast Setup

1. **Start Docker containers:**
```bash
docker-compose up -d
```

2. **Wait for containers to be healthy** (about 30 seconds)

3. **Run database migrations:**
```bash
docker exec -it language_learning_backend npm run migrate
```

4. **Fetch translation data:**
```bash
docker exec -it language_learning_backend npm run fetch-data
```

5. **Seed the database:**
```bash
docker exec -it language_learning_backend npm run seed
```

6. **Open app:** http://localhost:5173

## 📝 First Use

1. Register a new account
2. Click "Start Practice" to begin learning
3. View your progress on the Dashboard

## 🔍 Useful Commands

**View logs:**
```bash
docker-compose logs -f
```

**Stop containers:**
```bash
docker-compose down
```

**Restart containers:**
```bash
docker-compose restart
```

**Access PostgreSQL:**
```bash
docker exec -it language_learning_db psql -U user -d language_learning
```

## ⚡ Troubleshooting

**Containers won't start:**
- Make sure Docker Desktop is running
- Check if ports 3001, 5173, 5432 are available
- Try: `docker-compose down && docker-compose up --build`

**No words showing up:**
- Make sure you ran the fetch-data and seed commands
- Check backend logs: `docker-compose logs backend`

**Frontend can't connect to backend:**
- Verify backend is running: http://localhost:3001/health
- Check VITE_API_URL in docker-compose.yml

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the UI in frontend/src
- Add more words by modifying the seed script
- Deploy to Railway or Vercel

Happy learning! 🎉
