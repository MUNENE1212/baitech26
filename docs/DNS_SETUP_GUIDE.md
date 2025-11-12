# DNS Setup Guide

How to point your domain to your HostAfrica VPS server.

---

## 📋 Prerequisites

Before you start, you need:

1. **Domain name** - Purchased from a registrar (e.g., Namecheap, GoDaddy, Kenya Web Experts)
2. **VPS server IP address** - From HostAfrica
3. **Access to domain DNS settings** - Login to your domain registrar

---

## 🔍 Step 1: Get Your VPS IP Address

### From HostAfrica

1. Log into your HostAfrica account
2. Go to your VPS/Cloud Server dashboard
3. Find your server's **public IP address**

Example: `41.90.X.X` (Kenya IP range)

**Or via SSH:**

```bash
# Connect to your server
ssh root@YOUR_SERVER_IP

# Check IP address
curl ifconfig.me
# or
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

**Save this IP address** - you'll need it for DNS configuration.

---

## 🌐 Step 2: Configure DNS Records

### Option A: If Domain is Registered in Kenya

Common registrars: Kenya Web Experts, Access Kenya, etc.

#### 1. Login to Your Domain Registrar

Go to your domain registrar's website and login.

#### 2. Find DNS Management

Look for:
- "DNS Management"
- "DNS Settings"
- "Name Servers"
- "Domain Settings"

#### 3. Add DNS Records

**Add these two records:**

**Record 1: Root Domain**
```
Type: A
Name: @  (or leave blank, or "yourdomain.com")
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or Auto)
```

**Record 2: WWW Subdomain**
```
Type: A
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or Auto)
```

**Example:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 41.90.123.45 | 3600 |
| A | www | 41.90.123.45 | 3600 |

---

### Option B: Popular International Registrars

#### Namecheap

1. Go to https://www.namecheap.com
2. Sign in → Domain List → Manage
3. Click "Advanced DNS"
4. Add/Edit records:

```
Type: A Record
Host: @
Value: YOUR_VPS_IP
TTL: Automatic

Type: A Record
Host: www
Value: YOUR_VPS_IP
TTL: Automatic
```

5. Click "Save All Changes"

---

#### GoDaddy

1. Go to https://www.godaddy.com
2. Sign in → My Products → DNS
3. Click "Manage DNS" next to your domain
4. Add/Edit records:

```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 600 seconds

Type: A
Name: www
Value: YOUR_VPS_IP
TTL: 600 seconds
```

5. Click "Save"

---

#### Google Domains

1. Go to https://domains.google.com
2. Sign in → My domains → Manage
3. Click "DNS" in the left menu
4. Scroll to "Custom resource records"
5. Add:

```
Name: @
Type: A
TTL: 1H
Data: YOUR_VPS_IP

Name: www
Type: A
TTL: 1H
Data: YOUR_VPS_IP
```

6. Click "Add"

---

#### Cloudflare (If using for DNS)

1. Go to https://www.cloudflare.com
2. Sign in → Select your domain
3. Click "DNS"
4. Add records:

```
Type: A
Name: @
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud) - for initial setup
TTL: Auto

Type: A
Name: www
IPv4 address: YOUR_VPS_IP
Proxy status: DNS only (gray cloud)
TTL: Auto
```

5. Click "Save"

**Note**: After SSL is working, you can enable the proxy (orange cloud) for DDoS protection and caching.

---

## ⏱️ Step 3: Wait for DNS Propagation

DNS changes take time to propagate globally.

**Typical Wait Times:**
- **Minimum**: 5-15 minutes
- **Average**: 30 minutes to 2 hours
- **Maximum**: 24-48 hours (rare)

---

## ✅ Step 4: Verify DNS Configuration

### Check DNS Propagation

**Online Tools:**

1. **DNS Checker** - https://dnschecker.org
   - Enter your domain
   - Check A record
   - Should show your VPS IP globally

2. **What's My DNS** - https://www.whatsmydns.net
   - Enter your domain
   - Select "A" record type
   - Green checkmarks = propagated

3. **DNS Propagation Checker** - https://www.dnswatch.info

---

### Check from Command Line

**Linux/Mac/Windows (PowerShell):**

```bash
# Check root domain
nslookup yourdomain.com

# Check www subdomain
nslookup www.yourdomain.com

# Detailed DNS query
dig yourdomain.com
dig www.yourdomain.com

# Check specific DNS server
nslookup yourdomain.com 8.8.8.8
```

**Expected Output:**

```
Name:    yourdomain.com
Address: 41.90.123.45  ← Your VPS IP
```

---

### Test with Ping

```bash
ping yourdomain.com
ping www.yourdomain.com
```

**Expected:**

```
PING yourdomain.com (41.90.123.45): 56 data bytes
64 bytes from 41.90.123.45: icmp_seq=0 ttl=54 time=45.2 ms
```

If you see your VPS IP, DNS is working! ✅

---

## 🚀 Step 5: Deploy Your Application

Once DNS is propagated, deploy your application:

```bash
# On your VPS
cd /var/www
git clone <your-repo> baitech
cd baitech

# Run deployment scripts
sudo bash deployment/scripts/setup.sh
sudo bash deployment/scripts/deploy.sh

# Setup SSL (IMPORTANT: Wait until DNS is fully propagated!)
sudo bash deployment/scripts/setup-ssl.sh
```

**⚠️ Important**: Don't run SSL setup until DNS is fully propagated, or Let's Encrypt certificate will fail!

---

## 🔒 Step 6: Setup SSL (After DNS Works)

Once your domain resolves to your VPS:

```bash
cd /var/www/baitech
sudo bash deployment/scripts/setup-ssl.sh
```

**You'll be prompted for:**
1. Domain name (e.g., `yourdomain.com`)
2. Email address (for renewal notifications)

**This will:**
- Obtain SSL certificate from Let's Encrypt
- Configure Nginx with HTTPS
- Setup auto-renewal

**Then visit:**
- https://yourdomain.com ✅
- https://www.yourdomain.com ✅

Both should show a green padlock! 🔒

---

## 🛠️ Troubleshooting

### DNS Not Resolving

**Issue**: `nslookup` returns "server can't find domain"

**Solutions:**

1. **Double-check DNS records**
   - Verify A records are correct
   - Ensure no typos in IP address
   - Check TTL is set (3600 seconds is good)

2. **Wait longer**
   - DNS can take up to 48 hours
   - Check propagation: https://dnschecker.org

3. **Clear DNS cache** (on your computer)
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```

4. **Try different DNS server**
   ```bash
   nslookup yourdomain.com 8.8.8.8  # Google DNS
   nslookup yourdomain.com 1.1.1.1  # Cloudflare DNS
   ```

---

### Wrong IP Address Showing

**Issue**: DNS resolves to old or wrong IP

**Solutions:**

1. **Update DNS records**
   - Edit A records with correct IP
   - Save changes

2. **Lower TTL temporarily**
   - Change TTL to 300 (5 minutes)
   - Wait for old TTL to expire
   - Update IP
   - Change TTL back to 3600

3. **Check for CNAME conflicts**
   - Remove any conflicting CNAME records
   - Only use A records for root and www

---

### SSL Certificate Fails

**Issue**: Let's Encrypt can't verify domain

**Solutions:**

1. **Verify DNS is fully propagated**
   ```bash
   nslookup yourdomain.com
   # Must show your VPS IP
   ```

2. **Check firewall**
   ```bash
   sudo ufw status
   # Must allow ports 80 and 443
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Check Nginx is running**
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx
   ```

4. **Retry SSL setup**
   ```bash
   sudo bash deployment/scripts/setup-ssl.sh
   ```

---

### Domain Shows "Unable to Connect"

**Issue**: Browser can't reach server

**Solutions:**

1. **Check VPS is running**
   ```bash
   ssh root@YOUR_VPS_IP
   # Should connect
   ```

2. **Check application is running**
   ```bash
   pm2 status
   # Both backend and frontend should be online
   ```

3. **Check Nginx**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t  # Test config
   ```

4. **Check firewall**
   ```bash
   sudo ufw status
   # Allow Nginx Full
   ```

---

## 📝 DNS Record Types Explained

### A Record
- Points domain to IPv4 address
- Example: `yourdomain.com → 41.90.123.45`
- Use for: Root domain and subdomains

### CNAME Record
- Points domain to another domain
- Example: `www → yourdomain.com`
- Alternative to A record for www

**For Baitech, use A records for both @ and www** (simpler and faster)

### MX Record
- For email routing
- Not needed for website hosting
- Only if you want email@yourdomain.com

### TXT Record
- For verification and SPF records
- Not needed for basic website

---

## 🔄 Complete DNS Setup Checklist

- [ ] Get VPS IP address from HostAfrica
- [ ] Login to domain registrar
- [ ] Add A record: @ → VPS IP
- [ ] Add A record: www → VPS IP
- [ ] Save DNS changes
- [ ] Wait 15-30 minutes
- [ ] Check DNS propagation (dnschecker.org)
- [ ] Verify with `nslookup yourdomain.com`
- [ ] Test with `ping yourdomain.com`
- [ ] Deploy application to VPS
- [ ] Setup SSL certificate (after DNS works)
- [ ] Test HTTPS: https://yourdomain.com ✅

---

## 📞 Need Help?

### HostAfrica Support
- **Website**: https://www.hostafrica.co.ke
- **Phone**: +254 20 2606520
- **Email**: support@hostafrica.co.ke

### Domain Registrar Support
Contact your domain registrar if you can't find DNS settings.

### Check These Docs
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full deployment guide
- [DEPLOYMENT_FILES.md](DEPLOYMENT_FILES.md) - Configuration reference

---

## 🎯 Quick Reference

**For most setups, you just need:**

```
Domain: yourdomain.com
VPS IP: 41.90.X.X (your actual IP)

DNS Records:
┌──────┬──────┬──────────────┬──────┐
│ Type │ Name │ Value        │ TTL  │
├──────┼──────┼──────────────┼──────┤
│ A    │ @    │ 41.90.X.X    │ 3600 │
│ A    │ www  │ 41.90.X.X    │ 3600 │
└──────┴──────┴──────────────┴──────┘

Wait: 15-30 minutes
Verify: nslookup yourdomain.com
Deploy: bash deployment/scripts/deploy.sh
SSL: bash deployment/scripts/setup-ssl.sh
```

---

**Created**: November 12, 2025
**Last Updated**: November 12, 2025
