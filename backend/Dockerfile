# Use the official Node.js 18 image as a base (or another version you prefer)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code into the container
COPY . .

# Expose the port your server runs on
EXPOSE 6969

# Command to run the server
CMD [ "node", "server.js" ]
