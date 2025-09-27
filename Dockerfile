# Multi-stage build for full-stack app
FROM node:18-alpine as backend

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .

FROM node:18-alpine as frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/frontend/build ./frontend/build

# Install serve for frontend
RUN npm install -g serve

# Create uploads directory
RUN mkdir -p uploads/videos

# Expose ports
EXPOSE 5000 3000

# Start both services
CMD ["sh", "-c", "cd backend && npm start & serve -s frontend/build -l 3000 & wait"]
