

#!/bin/bash
echo "=== AutoBuy Update ==="

cd ~/autobuy

echo ">>> Git pull..."
git fetch origin
git reset --hard origin/main

echo ">>> Backend frissítés..."
cd Backend
npm install
pm2 restart autobuy-backend --update-env

echo ">>> Frontend build..."
cd ../frontend/my-vue-app
npm install
rm -rf dist/
npm run build

echo ">>> Nginx újratöltése..."
sudo systemctl reload nginx

echo "=== Kész! ==="
pm2 status
