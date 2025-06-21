# 🚀 Quick Start - CRM Apartment trên Raspberry Pi 3B

## 📋 Yêu cầu

- Raspberry Pi 3B với Pi OS Lite
- MicroSD Card 32GB+
- Kết nối internet
- Source code React hiện tại

## ⚡ Triển khai tự động (Khuyến nghị)

### 1. Chuẩn bị files
```bash
# Tải các files cần thiết vào Pi
scp database-local.sql deploy.sh pi@PI_IP_ADDRESS:/home/pi/
```

### 2. Copy source code React
```bash
# Copy toàn bộ source code React vào Pi
scp -r ./crm_apartment/ pi@PI_IP_ADDRESS:/home/pi/
```

### 3. Chạy script tự động
```bash
# SSH vào Pi
ssh pi@PI_IP_ADDRESS

# Cấp quyền và chạy script
chmod +x deploy.sh
./deploy.sh
```

Script sẽ tự động:
- ✅ Cài đặt Node.js 18 LTS
- ✅ Cài đặt và cấu hình MariaDB
- ✅ Thiết lập database với dữ liệu mẫu
- ✅ Cài đặt và cấu hình Nginx
- ✅ Tạo backend API
- ✅ Build React app
- ✅ Thiết lập systemd services
- ✅ Test toàn bộ hệ thống

## 🔧 Triển khai thủ công

Nếu muốn control từng bước, follow `pi-local-setup.md`

## 🎯 Sau khi cài đặt

### Truy cập hệ thống
- **Local (trên Pi)**: `http://localhost`
- **Từ mạng local**: `http://PI_IP_ADDRESS`

### Tài khoản test
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `manager1` | `manager123` | Manager |
| `nguyenvanan` | `user123` | User |

### Quản lý services
```bash
# Restart API
sudo systemctl restart crm-api

# Restart web server
sudo systemctl restart nginx

# Restart database
sudo systemctl restart mariadb

# Xem logs
sudo journalctl -u crm-api -f
```

### Monitoring
```bash
# System resources
htop

# Memory usage
free -h

# Disk space
df -h

# Check services
sudo systemctl status mariadb nginx crm-api
```

## 🔐 Bảo mật

### Thay đổi passwords mặc định
```sql
# Kết nối database
mysql -u root -p

# Thay đổi password users
USE crm_apartment;
UPDATE users SET password_hash = '$2b$10$NEW_HASH' WHERE username = 'admin';
```

### Cấu hình firewall (nếu cần)
```bash
# Chỉ cho phép SSH và HTTP từ mạng local
sudo ufw allow from 192.168.0.0/16 to any port 22
sudo ufw allow from 192.168.0.0/16 to any port 80
sudo ufw enable
```

## 🛠️ Troubleshooting

### API không start
```bash
# Xem logs chi tiết
sudo journalctl -u crm-api -f

# Kiểm tra .env file
cat /home/pi/crm_apartment/api/.env

# Test database connection
mysql -u crm_app -p -h localhost crm_apartment
```

### Website không load
```bash
# Kiểm tra Nginx
sudo nginx -t
sudo systemctl status nginx

# Kiểm tra build folder
ls -la /home/pi/crm_apartment/build/
```

### Database connection error
```bash
# Restart MariaDB
sudo systemctl restart mariadb

# Kiểm tra status
sudo systemctl status mariadb

# Xem logs
sudo tail -f /var/log/mysql/error.log
```

### RAM usage cao
```bash
# Restart all services
sudo systemctl restart crm-api mariadb nginx

# Kiểm tra memory
free -h

# Top processes
htop
```

## 📈 Performance Tips

### Tối ưu Pi 3B
```bash
# Tăng swap space
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=100/CONF_SWAPSIZE=512/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Giảm GPU memory
echo "gpu_mem=16" | sudo tee -a /boot/config.txt
sudo reboot
```

### Database optimization
```sql
# Optimize tables
USE crm_apartment;
OPTIMIZE TABLE users, apartments, tenants, contracts, invoices;
```

## 🔄 Backup & Restore

### Manual backup
```bash
# Backup database
mysqldump -u crm_admin -pCrmAdmin2024#VerySecure crm_apartment | gzip > /home/pi/backups/crm_$(date +%Y%m%d).sql.gz

# Backup source code
tar -czf /home/pi/backups/source_$(date +%Y%m%d).tar.gz /home/pi/crm_apartment/
```

### Restore database
```bash
# Extract backup
gunzip crm_20240315.sql.gz

# Restore
mysql -u root -p crm_apartment < crm_20240315.sql
```

## 📞 Support

Nếu gặp vấn đề:

1. **Kiểm tra logs**: `sudo journalctl -u crm-api -f`
2. **Restart services**: `sudo systemctl restart crm-api nginx mariadb`
3. **Check system resources**: `htop`, `free -h`, `df -h`
4. **Database connection**: `mysql -u crm_app -p crm_apartment`

## 🎉 Kết luận

Sau khi hoàn tất, bạn sẽ có:
- ✅ Hệ thống CRM apartment hoạt động hoàn chỉnh
- ✅ Database MariaDB tối ưu cho Pi 3B  
- ✅ Web server Nginx phục vụ React app
- ✅ RESTful API backend
- ✅ Auto-startup services
- ✅ Basic monitoring

**Happy coding! 🍓** 