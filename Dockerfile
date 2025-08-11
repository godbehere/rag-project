# Base image
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the default port
EXPOSE 3000

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]
