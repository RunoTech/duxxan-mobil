#!/bin/bash

# DUXXAN Apache Deployment Script
set -e

echo "🚀 Starting DUXXAN deployment process..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 3. Build backend
echo "⚙️ Building backend..."
npm run build:server 2>/dev/null || echo "No server build script found, using tsx for runtime"

# 4. Update database schema
echo "🗄️ Updating database schema..."
npm run db:push

# 5. Create production directories
echo "📁 Creating production directories..."
mkdir -p /var/www/duxxan
mkdir -p /var/www/duxxan/logs

# 6. Copy files
echo "📋 Copying files..."
cp -r dist/* /var/www/duxxan/
cp -r server /var/www/duxxan/
cp -r shared /var/www/duxxan/
cp -r lib /var/www/duxxan/
cp package.json /var/www/duxxan/
cp .env /var/www/duxxan/
cp -r node_modules /var/www/duxxan/

# 7. Set permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/duxxan
chmod -R 755 /var/www/duxxan

# 8. Create PM2 ecosystem
echo "⚡ Creating PM2 configuration..."
cat > /var/www/duxxan/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'duxxan-api',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/var/www/duxxan',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 9. Create Apache virtual host
echo "🌐 Creating Apache virtual host..."
cat > /etc/apache2/sites-available/duxxan.conf << EOF
<VirtualHost *:80>
    ServerName \${DOMAIN_NAME:-localhost}
    DocumentRoot /var/www/duxxan

    <Directory "/var/www/duxxan">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
    
    ProxyPass /ws/ ws://localhost:3000/ws/
    ProxyPassReverse /ws/ ws://localhost:3000/ws/

    ErrorLog \${APACHE_LOG_DIR}/duxxan_error.log
    CustomLog \${APACHE_LOG_DIR}/duxxan_access.log combined
</VirtualHost>
EOF

# 10. Enable Apache modules and site
echo "🔧 Configuring Apache..."
a2enmod rewrite proxy proxy_http proxy_wstunnel
a2ensite duxxan
a2dissite 000-default
systemctl reload apache2

# 11. Start PM2
echo "🚀 Starting backend with PM2..."
cd /var/www/duxxan
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ DUXXAN deployment completed!"
echo "📝 Check logs:"
echo "   - Apache: tail -f /var/log/apache2/duxxan_error.log"
echo "   - Backend: pm2 logs duxxan-api"
echo "   - Services: systemctl status apache2 postgresql redis-server"