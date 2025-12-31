# Deployment Guide - Railway + Vercel

## Edellytykset
- GitHub repository: https://github.com/2302304/Suomi-Englanti-App
- Railway account
- Vercel account

## 1. Railway Backend + PostgreSQL Setup

### A. Luo PostgreSQL Database
1. Railway Dashboard → **New Project** → **Provision PostgreSQL**
2. Kopioi `DATABASE_URL` muistiin (Variables-välilehdeltä)

### B. Luo Backend Service
1. Railway → **New** → **GitHub Repo** → Valitse `Suomi-Englanti-App`
2. **Settings:**
   - **Root Directory:** `backend`
   - Railway käyttää automaattisesti `Dockerfile`

3. **Variables** (Add Variable):
```
DATABASE_URL = <kopioi PostgreSQL:stä>
NODE_ENV = production
JWT_SECRET = <generoitu-turva-avain-32-merkkiä>
PORT = 8080
FRONTEND_URL = <päivitä myöhemmin Vercel URL>
```

4. **Generate Domain** (Settings → Networking → Public Networking)
   - Kopioi backend URL (esim. `https://suomi-englanti-app-production.up.railway.app`)

### C. Alusta tietokanta (VAIN KERRAN!)

**Railway CLI:llä** (suositus):
```bash
# Asenna Railway CLI
npm install -g @railway/cli

# Kirjaudu sisään
railway login

# Linkitä projekti
railway link

# Aja init-skripti
railway run sh scripts/init-db.sh
```

**TAI Railway Web Console:lla:**
1. Railway → Backend Service → Click **⋮** → Service Settings
2. Jos löytyy "Run Command" tai "Shell":
   ```bash
   npm run migrate && npm run seed
   ```

**TAI Deployment-aikana** (muuta Dockerfile tilapäisesti):
```dockerfile
# Muuta CMD-rivi:
CMD ["sh", "-c", "npm run migrate && npm run seed && npm run dev"]
# Deploy kerran, sitten palauta takaisin:
CMD ["npm", "run", "dev"]
```

## 2. Vercel Frontend Setup

1. **Vercel Dashboard** → **Add New** → **Project**
2. **Import** `Suomi-Englanti-App` from GitHub

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables:**
```
VITE_API_URL = <Railway backend URL>
```
   Esim: `https://suomi-englanti-app-production.up.railway.app`

5. **Deploy**

6. **Päivitä Railway FRONTEND_URL:**
   - Kopioi Vercel URL (esim. `https://suomi-englanti-app.vercel.app`)
   - Railway → Backend Service → Variables → Päivitä `FRONTEND_URL`

## 3. Testaus

1. Avaa Vercel URL selaimessa
2. Rekisteröidy uusi käyttäjä
3. Testaa:
   - ✅ Dashboard (näkyy 0 / 200 words)
   - ✅ Start Practice (flashcards)
   - ✅ Practice Sentences
   - ✅ Browse Dictionary (200 sanaa)
   - ✅ Logout

## Tärkeät Huomiot

### Tietokanta
- PostgreSQL on **pysyvä** - data säilyy Railway volume:ssa
- Migraatiot ja seed ajetaan **VAIN KERRAN**
- Uudet deploymentit eivät muuta tietokantaa

### Ympäristömuuttujat
**Railway (Backend):**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`
- `JWT_SECRET` - Turva-avain JWT tokenille
- `PORT=8080`
- `FRONTEND_URL` - Vercel URL CORS:ia varten

**Vercel (Frontend):**
- `VITE_API_URL` - Railway backend URL

### Debugging

**Railway Logs:**
```
railway logs
```

**Vercel Logs:**
Vercel Dashboard → Deployment → View Function Logs

**Tietokanta-yhteys:**
```bash
railway connect postgres
# Sitten:
\dt  # Listaa taulut
SELECT COUNT(*) FROM words;  # Pitäisi olla 200
SELECT COUNT(*) FROM sentences;  # Pitäisi olla 50
```

## Yleisiä Ongelmia

### CORS Error
- Tarkista että `FRONTEND_URL` on oikein Railwayssa
- Varmista että Vercel URL on ilman `/` lopussa

### "No words found"
- Tietokantaa ei ole seediattu
- Aja `railway run sh scripts/init-db.sh`

### Database connection error
- Tarkista että `DATABASE_URL` on oikein
- Varmista että backend ja PostgreSQL ovat samassa Railway projektissa
