#!/bin/bash
apt update && apt install docker.io -y
systemctl start docker
systemctl enable docker

cat <<EOF > /etc/systemd/system/demoapp.service
[Unit]
Description=NodeJS app
After=docker.service
Requires=docker.service

[Service]
Restart=Always
ExecStart=/usr/bin/docker run -p 3000:3000 ghcr.io/benc-uk/nodejs-demoapp:latest

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl start demoapp
systemctl enable demoapp