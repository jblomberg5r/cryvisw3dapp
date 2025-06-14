# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with a static server (e.g., Nginx)
FROM nginx:stable-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration (optional, but good for SPAs)
# If you have a custom nginx.conf, copy it here:
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# For a basic SPA, the default Nginx config might work, or you might need one like this:
# Create a default.conf for Nginx to handle SPA routing
COPY <<NGINX_CONF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX_CONF

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
