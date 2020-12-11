#!/bin/bash
# install_git_cmd=`aws ssm send-command \
# 	--instance-ids "$1" \
# 	--document-name "AWS-RunShellScript" \
# 	--comment "IP config" \
# 	--parameters commands="sudo yum update -y && sudo yum install git" \
#     --query "Command.CommandId" \
# 	--output text`
# git_clone_cmd=`aws ssm send-command \
# 	--instance-ids "$1" \
# 	--document-name "AWS-RunShellScript" \
# 	--comment "IP config" \
# 	--parameters commands="cd && git clone https://mcsscm.utm.utoronto.ca:9999/git/409/20f/repo_a3group37.git" \
#     --query "Command.CommandId" \
# 	--output text`
# aws ssm send-command \
# 	--instance-ids "$1" \
# 	--document-name "AWS-RunShellScript" \
# 	--comment "IP config" \
# 	--parameters commands="sudo yum update -y" \
#     --query "Command.CommandId" \
#     --region ""
# 	--output text

# echo $install_git_cmd
# echo $git_clone_cmd
# aws ssm list-command-invocations \
# 	--command-id $install_git_cmd \
# 	--details \
#     --query "CommandInvocations[].CommandPlugins[].Output[]"
# aws ssm list-command-invocations \
# 	--command-id $git_clone_cmd \
# 	--details \
#     --query "CommandInvocations[].CommandPlugins[].Output[]"

echo -n "Username: "
read
USERNAME=$REPLY
echo -n "Password: "
read -s
PASSWORD=$REPLY
ssh -i "~/.ssh/place_server.pem" $1 \
        "sudo yum update -y && sudo yum install git && \
        cd && git clone https://$USERNAME:$PASSWORD@mcsscm.utm.utoronto.ca:9999/git/409/20f/repo_a3group37.git &&\
        cd /repo_a3group37/place/server && \
        ./install_dependencies.sh && \
        ./start_server.sh
        "