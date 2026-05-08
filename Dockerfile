# ---------- FRONTEND ONLY ----------
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose frontend port
EXPOSE 5000

# Run the frontend dev server
CMD ["npm", "run", "start:frontend"]
