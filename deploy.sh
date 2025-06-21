#!/bin/bash

# =====================================================
# SCRIPT TRIỂN KHAI CRM APARTMENT TRÊN RASPBERRY PI 3B
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
PROJECT_DIR="/home/pi/crm_apartment"
API_DIR="$PROJECT_DIR/api"
BACKUP_DIR="/home/pi/backups"

# Check user
if [ "$USER" != "pi" ]; then
    print_error "Phải chạy với user 'pi'"
    exit 1
fi

# Update system
update_system() {
    print_step "Cập nhật hệ thống"
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl git vim htop mysql-client
}

# Install Node.js
install_nodejs() {
    print_step "Cài đặt Node.js"
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    print_info "Node.js: $(node --version)"
}

# Setup MariaDB
setup_mariadb() {
    print_step "Cài đặt MariaDB"
    sudo apt install -y mariadb-server mariadb-client
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    
    # Config
    sudo tee /etc/mysql/mariadb.conf.d/99-pi-local.cnf > /dev/null <<EOF
[mysqld]
bind-address = 127.0.0.1
port = 3306
innodb_buffer_pool_size = 128M
innodb_log_file_size = 32M
max_connections = 20
query_cache_size = 16M
tmp_table_size = 16M
skip-log-bin
EOF
    
    sudo systemctl restart mariadb
    print_warning "Thiết lập MySQL root password:"
    sudo mysql_secure_installation
}

# Setup database
setup_database() {
    print_step "Thiết lập database"
    if [ ! -f "database-local.sql" ]; then
        print_error "Không tìm thấy database-local.sql"
        exit 1
    fi
    mysql -u root -p < database-local.sql
}

# Setup Nginx
setup_nginx() {
    print_step "Cài đặt Nginx"
    sudo apt install -y nginx
    
    sudo tee /etc/nginx/sites-available/crm-apartment > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;
    
    location / {
        root $PROJECT_DIR/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/crm-apartment /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl enable nginx
    sudo systemctl restart nginx
}

# Setup project
setup_project() {
    print_step "Thiết lập project"
    mkdir -p $PROJECT_DIR $API_DIR $BACKUP_DIR
    
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_warning "Copy source code React vào $PROJECT_DIR trước"
        read -p "Đã copy source code? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Setup API
setup_api() {
    print_step "Thiết lập API"
    cd $API_DIR
    
    if [ ! -f "package.json" ]; then
        npm init -y
    fi
    
    npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
    
    # Create .env
    cat > .env <<EOF
DB_HOST=localhost
DB_USER=crm_app
DB_PASSWORD=CrmApp2024#SecurePassword
DB_NAME=crm_apartment
JWT_SECRET=$(openssl rand -base64 32)
PORT=3001
EOF
    
    # Create server.js
    cat > server.js <<'EOF'
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND status = "active"',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
}

# Build React
build_react() {
    print_step "Build React app"
    cd $PROJECT_DIR
    
    mkdir -p src/config
    cat > src/config/api.js <<EOF
const API_BASE_URL = '/api';
export default API_BASE_URL;
EOF
    
    npm install
    npm run build
}

# Setup service
setup_service() {
    print_step "Thiết lập service"
    
    sudo tee /etc/systemd/system/crm-api.service > /dev/null <<EOF
[Unit]
Description=CRM Apartment API
After=network.target mysql.service

[Service]
Type=simple
User=pi
WorkingDirectory=$API_DIR
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable crm-api
    sudo systemctl start crm-api
}

# Test system
test_system() {
    print_step "Kiểm tra hệ thống"
    sleep 3
    
    systemctl is-active --quiet mariadb && echo "✅ MariaDB" || echo "❌ MariaDB"
    systemctl is-active --quiet nginx && echo "✅ Nginx" || echo "❌ Nginx"
    systemctl is-active --quiet crm-api && echo "✅ API" || echo "❌ API"
    
    curl -s http://localhost:3001/health > /dev/null && echo "✅ API Health" || echo "❌ API Health"
}

# Show info
show_info() {
    print_step "Thông tin hệ thống"
    PI_IP=$(hostname -I | awk '{print $1}')
    
    echo "🎉 Cài đặt hoàn tất!"
    echo
    echo "📍 Truy cập:"
    echo "  • Local: http://localhost"
    echo "  • Network: http://$PI_IP"
    echo
    echo "🔑 Tài khoản test:"
    echo "  • admin / admin123"
    echo "  • manager1 / manager123"
    echo "  • nguyenvanan / user123"
}

# Main
main() {
    print_step "TRIỂN KHAI CRM APARTMENT"
    
    update_system
    install_nodejs
    setup_mariadb
    setup_database
    setup_nginx
    setup_project
    setup_api
    build_react
    setup_service
    test_system
    show_info
}

main "$@" 