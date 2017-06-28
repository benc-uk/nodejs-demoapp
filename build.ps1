npm install
docker build . -t bencuk/nodejs-demoapp
docker build . -f Dockerfile.node6 -t bencuk/nodejs-demoapp:node6
docker push bencuk/nodejs-demoapp
docker push bencuk/nodejs-demoapp:node6
