# Pre-Push Security Checklist

**STOP!** Before pushing your code to GitHub/GitLab, complete this checklist.

---

## ✅ Security Verification

### 1. Check for Committed Secrets

Run this command to check what will be committed:

```bash
git status
```

**Verify these files are NOT listed**:
- [ ] `.env`
- [ ] `.env.production`
- [ ] `.env.local`
- [ ] `baitech-frontend/.env.production.local`
- [ ] `baitech-frontend/.env.local`
- [ ] `setup_admin.py`
- [ ] `backups/`
- [ ] Any `*.pem`, `*.key`, `*.crt` files

### 2. Verify .gitignore is Working

Check that sensitive files are ignored:

```bash
git check-ignore .env .env.production setup_admin.py
```

All three should return the filename (meaning they're ignored).

### 3. Check Git History

Check if secrets were previously committed:

```bash
git log --all --full-history --source -- .env
git log --all --full-history --source -- setup_admin.py
```

If any results appear, run:

```bash
bash scripts/remove_secrets_from_git.sh
```

### 4. Review Staged Changes

```bash
git diff --staged
```

**Look for**:
- MongoDB connection strings with passwords
- SECRET_KEY values
- Admin passwords
- API keys or tokens
- Any credentials

### 5. Check for Hardcoded Credentials

Search for potential hardcoded secrets:

```bash
grep -r "mongodb+srv://" --include="*.py" --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "SECRET_KEY=" --include="*.py" --exclude=".env.example" --exclude-dir=venv .
grep -r "password.*=" --include="*.py" --exclude-dir=venv --exclude="setup_admin.py.example" . | grep -v "hashed_password"
```

**Expected results**:
- MongoDB strings should only appear in `.env.example` files
- SECRET_KEY should only be in `.env.example` files
- No hardcoded passwords except in `.example` files

---

## ✅ File Verification

### Files That SHOULD Be Committed

Check these files exist and will be committed:

```bash
ls -la .env.example
ls -la .env.production.example
ls -la baitech-frontend/.env.local.example
ls -la baitech-frontend/.env.production.example
ls -la setup_admin.py.example
ls -la .gitignore
ls -la SECURITY.md
ls -la README.md
```

All should exist.

### Files That SHOULD NOT Be Committed

Verify these are ignored:

```bash
# These should return: "Ignored"
git status --ignored | grep -E "(\.env$|setup_admin\.py$|backups/)"
```

---

## ✅ Environment Templates

### Verify Templates Have No Real Secrets

Check `.env.example`:

```bash
cat .env.example | grep -E "(SECRET_KEY|MONGO_URL)"
```

**Should see**:
- `SECRET_KEY=CHANGE_THIS_TO_A_SECURE_SECRET_KEY` ✓
- `MONGO_URL=mongodb://localhost:27017` ✓

**Should NOT see**:
- Any `mongodb+srv://` with real passwords ✗
- Any real SECRET_KEY values ✗

Check `.env.production.example`:

```bash
cat .env.production.example | grep -E "(SECRET_KEY|MONGO_URL)"
```

**Should see**:
- `SECRET_KEY=CHANGE_THIS_TO_NEW_SECRET_KEY_IN_PRODUCTION` ✓
- `MONGO_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER...` ✓ (placeholder only)

---

## ✅ Remove Actual Environment Files

If you've been testing, remove actual environment files from the repository:

```bash
# Remove from staging area (if accidentally added)
git rm --cached .env
git rm --cached .env.production
git rm --cached setup_admin.py
git rm --cached baitech-frontend/.env.local
git rm --cached baitech-frontend/.env.production.local

# The files will remain on disk but won't be committed
```

---

## ✅ Final Verification

### 1. Dry Run Commit

See what will be committed:

```bash
git add .
git status
```

Review the list carefully. Look for any:
- `.env` files (except `.example`)
- Files with credentials
- Backup files
- Database dumps
- SSL certificates

### 2. Search Staged Content

Search for secrets in staged changes:

```bash
git diff --staged | grep -i "mongodb+srv://"
git diff --staged | grep -i "password"
git diff --staged | grep -i "secret"
```

Review any matches carefully.

### 3. Check File Sizes

Large files might be backups or images:

```bash
git ls-files -z | xargs -0 du -h | sort -h | tail -20
```

Look for:
- Database dumps (`*.tar.gz`, `*.sql`)
- Large images (should be optimized)
- Backup files

---

## ✅ If You Find Secrets

### Already Staged

Remove from staging:

```bash
git reset HEAD <filename>
```

### Already Committed (Not Pushed)

Remove from last commit:

```bash
git reset HEAD~1
# Fix the files
git add .
git commit -m "Your message"
```

### Already Pushed

**CRITICAL**: Follow these steps immediately:

1. **Remove from history**:
   ```bash
   bash scripts/remove_secrets_from_git.sh
   ```

2. **Rotate all exposed secrets**:
   - Generate new SECRET_KEY
   - Change MongoDB Atlas password
   - Update all `.env` files
   - Restart services

3. **Force push** (coordinate with team):
   ```bash
   git push --force --all
   ```

4. **Review MongoDB Atlas logs** for unauthorized access

---

## ✅ Safe to Push Checklist

Only push when ALL items are checked:

- [ ] No `.env` files in git status (except `.example`)
- [ ] No `setup_admin.py` in git status (only `.example`)
- [ ] `.gitignore` is properly configured
- [ ] No secrets found in `git diff --staged`
- [ ] No MongoDB connection strings with real passwords
- [ ] No real SECRET_KEY values
- [ ] No admin passwords (except in `.example` with placeholders)
- [ ] All `.example` files use placeholders only
- [ ] `SECURITY.md` is included
- [ ] `README.md` is included
- [ ] Reviewed all staged files manually

---

## 🚀 Ready to Push

Once all checks pass:

```bash
git add .
git commit -m "Your commit message"
git push origin main  # or your branch name
```

---

## 📋 Quick Commands

### Complete Pre-Push Check

Run all checks at once:

```bash
# Check ignored files
git check-ignore .env .env.production setup_admin.py

# Check for secrets in staged files
git diff --staged | grep -iE "(mongodb\+srv|SECRET_KEY=.{20,}|password=.{5,})"

# Review what will be committed
git status

# Search for committed secrets in history
git log --all --full-history -- .env
```

If any command returns results, investigate before pushing!

---

## 🆘 Emergency: Secrets Were Pushed

1. **DO NOT** continue working - fix immediately
2. Run: `bash scripts/remove_secrets_from_git.sh`
3. Rotate all secrets (see `SECURITY.md`)
4. Force push to overwrite history
5. Check MongoDB Atlas logs
6. Notify team members

---

## 📚 Additional Resources

- [SECURITY.md](SECURITY.md) - Complete security guide
- [.gitignore](.gitignore) - Ignored files configuration
- [scripts/remove_secrets_from_git.sh](scripts/remove_secrets_from_git.sh) - Secret removal script

---

**Remember**: Once secrets are pushed to a public repository, assume they are compromised. Always rotate immediately!

---

**Last Updated**: November 12, 2025
