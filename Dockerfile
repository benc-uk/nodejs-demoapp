FROM node:6-alpine
LABEL Name="Node.js Demo App" Version=2.2.1
ENV NODE_ENV production
WORKDIR /usr/src/app

# NPM install for the server packages
COPY ["package.json", "./"]
RUN npm install --production --silent

# SSH Server support
RUN apk update \ 
  && apk add openssh \
  && echo "root:Docker!" | chpasswd
RUN ssh-keygen -A
COPY sshd_config /etc/ssh/

# Copy in the Node server.js first
COPY . .

# Fixes issues with build in Dockerhub
RUN chmod a+x ./dockerentry.sh

EXPOSE 2222 3000
ENTRYPOINT [ "./dockerentry.sh" ]