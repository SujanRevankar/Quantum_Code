# Stage 1: Build the application
FROM node:16 AS build 

# Set the working directory
WORKDIR /src

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the actual frontend code
COPY . .

# Build the application
RUN npm run build 

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production

# Copy the build output to Nginx's HTML directory
COPY --from=build /src/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
