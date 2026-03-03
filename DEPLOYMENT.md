\# AutoBuy – Telepítési és Indítási Útmutató



\## Követelmények

\- VPS (Ubuntu 24), Node.js 20+, PM2, Nginx



---



\## 1. Repo klónozása

```bash

git clone https://github.com/autobuy951-cyber/autobuy.git

cd autobuy

```



\## 2. Backend indítása

```bash

cd Backend

npm install

nano .env

```

\*\*.env tartalma:\*\*

```

JWT\_SECRET=your\_jwt\_secret\_key\_here

PORT=3000

EMAIL\_HOST=smtp.gmail.com

EMAIL\_PORT=587

EMAIL\_USER=autobuy951@gmail.com

EMAIL\_PASS=your\_app\_password

EMAIL\_FROM=AutoBuy <autobuy951@gmail.com>

FRONTEND\_URL=http://autokolcsonzesonline.com

```

```bash

npm install -g pm2

pm2 start app.js --name autobuy-backend

pm2 save

pm2 startup

\# Futtasd a kiírt sudo parancsot!

```



\## 3. Frontend build

```bash

cd ../frontend/my-vue-app

npm install

npm run build

```



\## 4. Nginx konfiguráció

```bash

sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/autobuy

```

```nginx

server {

&nbsp;   listen 80;

&nbsp;   server\_name autokolcsonzesonline.com www.autokolcsonzesonline.com;

&nbsp;   root /home/FELHASZNALO/autobuy/frontend/my-vue-app/dist;

&nbsp;   index index.html;

&nbsp;   location / { try\_files $uri $uri/ /index.html; }

&nbsp;   location /api/ {

&nbsp;       proxy\_pass http://localhost:3000;

&nbsp;       proxy\_http\_version 1.1;

&nbsp;       proxy\_set\_header Host $host;

&nbsp;       proxy\_set\_header X-Real-IP $remote\_addr;

&nbsp;   }

}

```

```bash

sudo ln -s /etc/nginx/sites-available/autobuy /etc/nginx/sites-enabled/

sudo nginx -t

sudo systemctl reload nginx

```



\## 5. DNS (Google Cloud DNS)

| Típus | Név | Érték |

|-------|-----|-------|

| A | @ | VPS\_IP |

| A | www | VPS\_IP |



\## 6. HTTPS

```bash

sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d autokolcsonzesonline.com -d www.autokolcsonzesonline.com

```



\## Frissítés

```bash

cd ~/autobuy \&\& git pull origin main

cd Backend \&\& npm install \&\& pm2 restart autobuy-backend --update-env

cd ../frontend/my-vue-app \&\& npm install \&\& npm run build

```



\## VPS újraindítás után (manuális)



\### Ha a backend leállt:

```bash

pm2 list                          # állapot ellenőrzés

pm2 start app.js --name autobuy-backend   # ha nem fut

pm2 restart autobuy-backend --update-env  # ha fut de hibás

```



\### Ha az Nginx leállt:

```bash

sudo systemctl status nginx       # állapot ellenőrzés

sudo systemctl start nginx        # indítás

sudo systemctl reload nginx       # újratöltés (config változás után)

```



\### Teljes újraindítás (minden egyszerre):

```bash

pm2 resurrect                     # összes PM2 process visszaállítása

sudo systemctl start nginx

```



\### Automatikus indítás ellenőrzése:

```bash

pm2 startup    # ha még nincs beállítva

pm2 save       # aktuális process lista mentése

sudo systemctl enable nginx       # nginx autostart

```



\### Logok hibakereséshez:

```bash

pm2 logs autobuy-backend --lines 50

sudo journalctl -u nginx --no-pager -n 50

```

