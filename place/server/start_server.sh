echo "Installing dependencies"
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install nodejs -y
npm install
sudo npm install pm2@latest -g
echo "Redirecting ports"
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
pm2 start npm -- run startprod