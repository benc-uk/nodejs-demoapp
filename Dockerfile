FROM node:6-alpine
LABEL Name="Node.js Demo App" Version=1.1.0 
ENV NODE_ENV production
WORKDIR /usr/src/app

# NPM install for the server packages
COPY ["package.json", "./"]
RUN npm install --production --silent

# Copy in the Node server.js first
COPY . .

EXPOSE 3000
CMD npm start