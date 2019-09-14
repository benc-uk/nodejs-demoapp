FROM stefanscherer/node-windows:10.16.3-nanoserver-1809
LABEL Name="Node.js Demo App" Version=4.2.2
ENV NODE_ENV production
WORKDIR /app 

# For Docker layer caching do this BEFORE copying in rest of app
COPY package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the rest of the project to the workdir
COPY . .

# Port 3000 for our Express server 
EXPOSE 3000
ENTRYPOINT ["npm", "start"]