FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

# Ensure seed files are copied
COPY src/db/seeds/*.json ./src/db/seeds/

# Expose the port that Railway provides
EXPOSE 8080

# Run migrations, seed data, and start the server
CMD ["sh", "-c", "npm run migrate; npm run seed; npm run dev"]
