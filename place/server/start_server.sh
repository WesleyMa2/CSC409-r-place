echo "Redirecting ports"
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
pkill -f "server.js"
NODE_ENV=production && node server.js &