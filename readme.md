## Simple Node.js web application
Uses Express MVC framework, based on standard generated template with Pug views `express --view=pug myapp`
App will show some basic OS information and also detect if it is running from within a Docker container.  

<img src="https://user-images.githubusercontent.com/14982936/27593603-772a1236-5b4f-11e7-950f-7a8487f99251.png" alt="screenshot" style="width: 800px;"/>
 

## Usage 
Standard `npm install` and start with `npm start`. Web app will be listening on the usual Express port 3000


## Docker Images
Public Docker image is [available on Dockerhub](https://hub.docker.com/r/bencuk/nodejs-demoapp/)


## Updates
* June 2017 - Moved repo to Github
* July 2017 - Updated Dockerfile to use super tiny Alpine Node 6 image
