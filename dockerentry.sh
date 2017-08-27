#!/bin/sh

# Start SSH, can't start as service, this is next best thing
/usr/sbin/sshd -D &

# Start app with NPM
npm start