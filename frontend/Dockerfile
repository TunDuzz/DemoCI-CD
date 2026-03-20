# Stage 1: Build the React Application
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the React Application using Nginx
FROM alpine
# Copy the built files from Stage 1 into the mount folder
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["tail", "-f", "/dev/null"]
