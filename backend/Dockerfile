FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port that Railway provides
EXPOSE 8080

# Start the server (migrations already completed)
CMD ["npm", "run", "dev"]
