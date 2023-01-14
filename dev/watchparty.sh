# Allow ssh, http, https
ufw allow http
ufw allow https
ufw allow ssh
ufw allow 3000
# Enable ufw
ufw enable

# Install nginx/bind9
apt install -y nginx
apt install -y bind9

echo 'worker_rlimit_nofile 4096;
events {
  worker_connections  4096;
}
http {

  upstream rr {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    # server 127.0.0.1:3003;
  }

  upstream 1 {
    server 127.0.0.1:3001;
  }

  upstream 2 {
    server 127.0.0.1:3002;
  }

  upstream 3 {
    server 127.0.0.1:3003;
  }

  map $arg_shard $pool {
     default "rr";
     1 "1";
     2 "2";
     # 3 "3";
  }

  server {
    listen 80;
    location / {
      proxy_pass http://$pool;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header  X-Real-IP $remote_addr;
      proxy_set_header Host $host;

      # enable WebSockets
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}' > /etc/nginx/nginx.conf
/etc/init.d/nginx reload

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
sudo docker run --log-opt max-size=1g -d --name postgres --restart=always -e POSTGRES_PASSWORD=password --net=host -v $PWD/sql/:/docker-entrypoint-initdb.d/ postgres

# Install NodeJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# Set up certbot or Cloudflare HTTPS

# Build watchparty
npm run build

# Set .env config
echo '
DATABASE_URL=postgresql://postgres@localhost:5432/postgres?sslmode=disable
REDIS_URL=localhost:6379
' > .env

# Install PM2 globally
npm install -g pm2

# PM2 start
npm run pm2

# Run on startup
./node_modules/pm2/bin/pm2 startup
./node_modules/pm2/bin/pm2 save