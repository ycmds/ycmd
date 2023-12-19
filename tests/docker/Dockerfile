FROM ubuntu:22.04

RUN apt-get update

RUN apt-get install -y curl git python3 make gcc

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

RUN npm i -g ycmd  --loglevel verbose

RUN ycmd --version