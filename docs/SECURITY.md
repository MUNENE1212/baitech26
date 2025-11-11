# Security Guide

## Overview

This document outlines security best practices for the Baitech e-commerce platform.

---

## 🔐 Sensitive Files (NEVER COMMIT!)

The following files contain sensitive information and must **NEVER** be committed to version control:

### Environment Files
- `.env` - Backend production/development secrets
- `.env.production` - Backend production configuration
- `.env.local` - Backend local overrides
- `baitech-frontend/.env.production.local` - Frontend production secrets
- `baitech-frontend/.env.local` - Frontend local overrides

### Scripts with Credentials
- `setup_admin.py` - Contains admin password (use `.example` version)
- `seed_database.py` - May contain database credentials

### Deployment Files
- `ecosystem.config.js.local` - PM2 config with production paths
- `backups/*.tar.gz` - Database backups

### Certificates and Keys
- `*.pem`, `*.key`, `*.crt`, `*.p12` - SSL certificates and private keys

---

## ✅ What TO Commit

Always commit these template files:

- `.env.example` - Backend environment template
- `.env.production.example` - Backend production template
- `baitech-frontend/.env.local.example` - Frontend development template
- `baitech-frontend/.env.production.example` - Frontend production template
- `setup_admin.py.example` - Admin setup template
- `.gitignore` - Git ignore rules

---

## 🛡️ Security Checklist

### Before First Commit

- [ ] Verify `.gitignore` is properly configured
- [ ] Remove any committed `.env` files from git history
- [ ] Replace all example files with templates (`.example` versions)
- [ ] Ensure no hardcoded passwords in committed files
- [ ] Check MongoDB connection strings don't contain passwords

### Before Production Deployment

- [ ] Generate new `SECRET_KEY` for production
- [ ] Use strong admin password (not `Admin123!`)
- [ ] Enable MongoDB Atlas IP whitelist (don't use `0.0.0.0/0`)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL on production
- [ ] Set up firewall rules (UFW)
- [ ] Disable SSH password authentication (use keys only)
- [ ] Change default SSH port (optional but recommended)
- [ ] Set up automated backups
- [ ] Enable fail2ban for brute-force protection

### Regular Maintenance

- [ ] Rotate `SECRET_KEY` every 90 days
- [ ] Review MongoDB Atlas access logs
- [ ] Check Nginx access logs for suspicious activity
- [ ] Update dependencies regularly (`npm audit`, `pip-audit`)
- [ ] Test backup restoration quarterly
- [ ] Review user accounts and remove inactive admins

---

## 🔑 Generating Secure Secrets

### SECRET_KEY (Backend)

Generate a cryptographically secure secret key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output to your `.env` file:

```bash
SECRET_KEY=YOUR_GENERATED_SECRET_KEY_HERE
```

### Admin Password

Use a strong password with:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- Not reused from other services

Generate with:

```bash
python3 -c "import secrets; import string; chars = string.ascii_letters + string.digits + string.punctuation; print(''.join(secrets.choice(chars) for _ in range(16)))"
```

---

## 🚨 What to Do If Secrets Are Exposed

### 1. Secrets Committed to Git

If you accidentally committed secrets:

**Option A: Remove from latest commit (if not pushed)**

```bash
git reset HEAD~1
# Edit files to remove secrets
git add .
git commit -m "Add configuration files"
```

**Option B: Remove from git history (if pushed)**

```bash
# Install BFG Repo-Cleaner
# Remove .env files from entire history
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**⚠️ WARNING**: Force pushing rewrites history. Coordinate with team members!

### 2. Secrets Pushed to Public Repository

If secrets were pushed to a public repository (GitHub, GitLab, etc.):

1. **Immediately rotate all exposed secrets**:
   - Generate new `SECRET_KEY`
   - Change MongoDB Atlas password
   - Update all `.env` files on servers
   - Restart backend services

2. **Change admin passwords**:
   ```bash
   python3 setup_admin.py.example
   # Set new password via environment variable
   ```

3. **Revoke MongoDB Atlas credentials**:
   - Go to MongoDB Atlas → Database Access
   - Delete compromised user
   - Create new user with new password
   - Update `.env` with new connection string

4. **Remove from git history** (see above)

5. **Check for unauthorized access**:
   - Review MongoDB Atlas logs
   - Check server access logs
   - Look for new user accounts
   - Scan for unusual API activity

### 3. Secrets in Container Images

If you build Docker images, ensure `.env` files are NOT included:

Add to `.dockerignore`:

```
.env
.env.*
*.pyc
__pycache__
node_modules
.git
```

---

## 🔒 MongoDB Security

### Connection String Format

Never commit connection strings with passwords!

**Bad** ❌:
```bash
MONGO_URL=mongodb+srv://user:MyPassword123@cluster.mongodb.net/db
```

**Good** ✅:
```bash
# In .env.example (committed)
MONGO_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DBNAME

# In .env (NOT committed)
MONGO_URL=mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb
```

### MongoDB Atlas Security

1. **IP Whitelist**: Only allow your server IPs
   - Go to Network Access
   - Add your server IP: `YOUR_SERVER_IP/32`
   - Remove `0.0.0.0/0` (allow all) in production

2. **Database User Permissions**:
   - Use least privilege principle
   - Create separate users for dev/staging/production
   - Regularly rotate passwords

3. **Enable Audit Logs**:
   - Track database access
   - Monitor for suspicious queries
   - Review regularly

---

## 🌐 API Security

### JWT Token Security

Current implementation in `utils/auth.py`:

```python
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**Recommendations**:

1. **Use strong SECRET_KEY**: Minimum 32 bytes
2. **Short token expiry**: Keep at 30 minutes or less
3. **Implement refresh tokens**: For longer sessions
4. **Store tokens securely**: Use httpOnly cookies (not localStorage)

### CORS Configuration

In production `.env`:

```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Never use**:
```bash
CORS_ORIGINS=*  # ❌ Allows any domain!
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```python
# In main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request, ...):
    ...
```

---

## 📝 Audit Logging

### What to Log

Log security-relevant events:

- User login attempts (success/failure)
- Admin actions (create/update/delete)
- Password changes
- File uploads
- Database queries (in development only)

### What NOT to Log

**Never log**:
- Passwords (plaintext or hashed)
- Full credit card numbers
- API keys or tokens
- Personally identifiable information (PII)

### Example

```python
# Good logging
logger.info(f"User login successful: {user_email}")
logger.warning(f"Failed login attempt: {user_email}")

# Bad logging ❌
logger.info(f"User logged in: {user_email} with password {password}")
```

---

## 🔐 Password Security

### Current Implementation

Uses `passlib` with bcrypt:

```python
# utils/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**✅ Good**: Uses bcrypt (secure, slow hashing)

### Password Requirements

Enforce strong passwords:

```python
import re

def validate_password(password: str) -> bool:
    """
    Password must have:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False

    if not re.search(r"[A-Z]", password):
        return False

    if not re.search(r"[a-z]", password):
        return False

    if not re.search(r"\d", password):
        return False

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False

    return True
```

---

## 🛡️ Input Validation

### SQL/NoSQL Injection Prevention

**MongoDB** is generally safe from SQL injection, but still validate inputs:

```python
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    password: str

    @validator('email')
    def email_must_be_valid(cls, v):
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", v):
            raise ValueError('Invalid email format')
        return v
```

### XSS Prevention

Next.js escapes content by default, but be careful with `dangerouslySetInnerHTML`:

```tsx
// Bad ❌
<div dangerouslySetInnerHTML={{__html: userInput}} />

// Good ✅
<div>{userInput}</div>  // Automatically escaped
```

### File Upload Security

In `routes/admin_routes.py`:

```python
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}

# Validate file extension
file_ext = Path(filename).suffix.lower()
if file_ext not in ALLOWED_EXTENSIONS:
    raise HTTPException(400, "Invalid file type")

# Validate file content (not just extension)
try:
    image = Image.open(io.BytesIO(image_bytes))
    image.verify()  # Ensures it's a valid image
except:
    raise HTTPException(400, "Invalid image file")
```

---

## 🔍 Security Scanning

### Regular Security Audits

**Python dependencies**:

```bash
pip install pip-audit
pip-audit
```

**Node.js dependencies**:

```bash
cd baitech-frontend
npm audit
npm audit fix
```

**Secrets scanning**:

```bash
# Install gitleaks
# Scan for secrets in git history
gitleaks detect --source . --verbose
```

---

## 📞 Incident Response

### If a Security Breach Occurs

1. **Isolate affected systems**
2. **Rotate all credentials immediately**
3. **Review access logs**
4. **Notify affected users** (if user data compromised)
5. **Document the incident**
6. **Implement fixes**
7. **Post-mortem review**

### Contact

For security issues, contact:
- Email: security@baitech.com
- Or create a private security advisory on GitHub

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated**: November 12, 2025
**Review Frequency**: Quarterly
