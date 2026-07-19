# Use Node.js 18 Alpine for a lightweight base image
FROM node:18-alpine

# Set working directory for the application
WORKDIR /app

# Copy backend dependency descriptors and install them
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy application backend and frontend sources
COPY backend ./backend
COPY frontend ./frontend

# Default runtime port (can be customized via env variable)
ENV PORT=6969

# Expose application port
EXPOSE 6969

# Run the backend Express server
CMD [ "node", "backend/server.js" ]
