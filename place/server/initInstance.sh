#!/bin/bash
echo -n "Username: "
read
USERNAME=$REPLY
echo -n "Password: "
read -s
PASSWORD=$REPLY
ssh -i "~/.ssh/place_server.pem" ec2-user@$1 \
        "sudo yum update -y && sudo yum install git && \
        cd && rm -r -f repo_a3group37/ && \
        git clone https://$USERNAME:$PASSWORD@mcsscm.utm.utoronto.ca:9999/git/409/20f/repo_a3group37.git && \
        cd ~/repo_a3group37/place/server && chmod 700 * &&\
        ./install_dependencies.sh && \
        ./start_server.sh
        "
