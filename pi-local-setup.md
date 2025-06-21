# 🍓 Setup CRM Apartment trên Raspberry Pi 3B (Local)

Hướng dẫn triển khai toàn bộ hệ thống (Frontend + Database) trên cùng một Raspberry Pi 3B

## 📋 Kiến trúc hệ thống

```
Raspberry Pi 3B (1GB RAM)
├── MariaDB Server (localhost:3306)
├── Node.js Backend API (localhost:3001) 
├── React Frontend (build static)
└── Nginx Web Server (port 80)
```

## 🚀 Bước 1: Chuẩn bị hệ thống

### Cập nhật Pi OS
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git vim htop
```

### Cài đặt Node.js (LTS)
```bash
# Cài đặt Node.js 18 LTS cho ARM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra version
node --version
npm --version
```

## 🗄️ Bước 2: Setup MariaDB (Local only)

### Cài đặt MariaDB
```bash
sudo apt install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### Bảo mật MariaDB
```bash
sudo mysql_secure_installation
```

### Cấu hình tối ưu cho Pi 3B
```bash
sudo nano /etc/mysql/mariadb.conf.d/99-pi-local.cnf
```

**Nội dung:**
```ini
[mysqld]
# Local only
bind-address = 127.0.0.1
port = 3306

# Memory optimization cho Pi 3B
innodb_buffer_pool_size = 128M
innodb_log_file_size = 32M
max_connections = 20
query_cache_size = 16M
tmp_table_size = 16M
skip-log-bin
```

```bash
sudo systemctl restart mariadb
```

## 🌐 Bước 3: Setup Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Cấu hình Nginx
```bash
sudo nano /etc/nginx/sites-available/crm-apartment
```

**Nội dung:**
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Serve React static files
    location / {
        root /home/pi/crm_apartment/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/crm-apartment /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Bước 4: Tạo Backend API

### Setup project
```bash
cd /home/pi
mkdir -p crm_apartment/api
cd crm_apartment/api
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
```

### Tạo .env
```bash
nano .env
```

**Nội dung:**
```env
DB_HOST=localhost
DB_USER=crm_app
DB_PASSWORD=CrmApp2024#SecurePassword
DB_NAME=crm_apartment
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

### Tạo server.js
```bash
nano server.js
```

**Nội dung:**
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Login
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
```

## 🎨 Bước 5: Setup React App

### Copy code hiện tại
```bash
cd /home/pi/crm_apartment
# Copy toàn bộ source code React hiện tại vào đây
```

### Cấu hình API
Tạo file `src/config/api.js`:
```javascript
const API_BASE_URL = '/api';
export default API_BASE_URL;
```

### Build production
```bash
npm install
npm run build
```

## 🔧 Bước 6: Setup Services

### Tạo systemd service cho API
```bash
sudo nano /etc/systemd/system/crm-api.service
```

**Nội dung:**
```ini
[Unit]
Description=CRM Apartment API
After=network.target mysql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/crm_apartment/api
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable crm-api
sudo systemctl start crm-api
```

## 📊 Bước 7: Monitoring

### Script monitor
```bash
sudo nano /usr/local/bin/pi-monitor.sh
```

**Nội dung:**
```bash
#!/bin/bash

# Kiểm tra RAM
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "$(date): CẢNH BÁO RAM: ${MEMORY_USAGE}%" >> /var/log/crm-monitor.log
    sudo systemctl restart crm-api
fi

# Kiểm tra services
for service in mariadb nginx crm-api; do
    if ! systemctl is-active --quiet $service; then
        echo "$(date): Restart $service" >> /var/log/crm-monitor.log
        sudo systemctl start $service
    fi
done
```

```bash
sudo chmod +x /usr/local/bin/pi-monitor.sh
```

### Cron jobs
```bash
sudo crontab -e
```

**Thêm:**
```bash
# Backup database hàng ngày
0 2 * * * mysqldump -u crm_admin -pCrmAdmin2024#VerySecure crm_apartment | gzip > /home/pi/backups/crm_$(date +\%Y\%m\%d).sql.gz

# Monitor system
*/30 * * * * /usr/local/bin/pi-monitor.sh

# Cleanup old backups
0 3 * * * find /home/pi/backups -name "*.sql.gz" -mtime +7 -delete
```

## ✅ Test hệ thống

### Kiểm tra services
```bash
sudo systemctl status mariadb nginx crm-api
```

### Test API
```bash
curl http://localhost:3001/health
```

### Test website
```bash
curl http://localhost/
```

## 🎯 Truy cập

**Local (trên Pi):** `http://localhost`  
**Từ mạng local:** `http://PI_IP_ADDRESS`

## 🔧 Performance Tips

### Monitor resources
```bash
htop           # CPU/RAM usage
free -h        # Memory details  
df -h          # Disk space
```

### Restart services nếu cần
```bash
sudo systemctl restart crm-api mariadb nginx
``` 