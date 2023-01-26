# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY . .

# Install the dependencies
RUN npm install

EXPOSE 8080

# Run the application
CMD ["npm run dev"]