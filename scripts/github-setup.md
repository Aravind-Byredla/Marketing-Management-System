# Push to GitHub

## 1. Initialize git (run inside mbrms folder)
```bash
git init
git add .
git commit -m "feat: initial MBRMS project"
```

## 2. Create repo on GitHub
- Go to https://github.com/new
- Name: mbrms  
- Set to Private
- Do NOT initialize with README

## 3. Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/mbrms.git
git branch -M main
git push -u origin main
```
