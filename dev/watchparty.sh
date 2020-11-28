# Allow ssh, http, https
ufw allow http
ufw allow https
ufw allow ssh
# Enable ufw
ufw enable

# Install git
apt update
apt install -y git

# Clone application code
git clone https://github.com/howardchung/watchparty

# Install docker
curl -sSL https://get.docker.com/ | sh
# Start Redis
sudo docker run --log-opt max-size=1g -d --name redis --restart=always --net=host redis
# Start Postgres
sudo docker run --log-opt max-size=1g -d --name postgres --restart=always -e POSTGRES_PASSWORD=password --net=host postgres

# Install NodeJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# Set up certbot

# Build watchparty
npm run build

# Set .env config
echo '
DATABASE_URL=localhost:5432
REDIS_URL=localhost:6379
' > .env

# Install PM2 globally
npm install -g pm2

# PM2 start

# Run on startup
