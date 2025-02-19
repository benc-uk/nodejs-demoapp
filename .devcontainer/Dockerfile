FROM registry.suse.com/bci/nodejs:20

RUN zypper --non-interactive install -y tar git gzip openssh make
RUN useradd -ms /bin/bash node

ARG USERNAME=node
ARG NPM_GLOBAL=/usr/local/share/npm-global

# Add NPM global to PATH.
ENV PATH=${NPM_GLOBAL}/bin:${PATH}

USER node 
WORKDIR /home/node
EXPOSE 3000