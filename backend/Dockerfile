FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port that Railway provides
EXPOSE 8080

# Run migrations and start the server
CMD ["sh", "-c", "npm run migrate && npm run dev"]
