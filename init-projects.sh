#!/bin/bash

npm init -y #Khởi tạo package.json 

# Cài đặt các thư viện (dependencies) và thư viện phát triển (devDependencies)
echo "Installing dependencies..."
npm install @supabase/supabase-js dotenv express jsonwebtoken cors
npm install --save-dev nodemon

# Tạo cấu trúc thư mục
echo "Creating folder structure..."
mkdir -p src/config src/controllers src/services src/repositories src/routes src/middlewares src/utils
touch src/app.js
touch src/routes/index.js
touch .env
touch .gitignore

echo "node_modules" >> .gitignore
echo ".env" >> .gitignore

# Thông báo hoàn tất
echo "--------------------------------------"
echo "Structure and dependencies created successfully!"
echo "To start development, run: npm install"
echo "--------------------------------------"