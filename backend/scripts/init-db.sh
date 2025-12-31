#!/bin/sh
# Initialize database with migrations and seed data
# Run this ONCE after creating the Railway project

echo "🚀 Initializing database..."

# Run migrations
echo "📝 Running migrations..."
npm run migrate

# Run seed
echo "🌱 Seeding database..."
npm run seed

echo "✅ Database initialization complete!"
