ARG IMAGE_BASE=12-alpine

FROM node:$IMAGE_BASE
LABEL Name="Node.js Demo App" Version=4.5.0
ENV NODE_ENV production
WORKDIR /app 

# For Docker layer caching do this BEFORE copying in rest of app
COPY src/package*.json ./
RUN npm install --production

# NPM is done, now copy in the rest of the project to the workdir
COPY src/. .

# Port 3000 for our Express server 
EXPOSE 3000
ENTRYPOINT ["npm", "start"]