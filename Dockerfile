# ---------- BUILD / DEV STAGE ----------
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose backend and frontend ports
EXPOSE 5000
EXPOSE 5173

# Default command to run both backend and frontend
CMD ["sh", "-c", "npm run start:backend & npm run start:frontend"]


