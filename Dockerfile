FROM node:20-alpine
WORKDIR /app

# 1. Kopiujemy pliki zależności
COPY package*.json ./
RUN npm install

# 2. Kopiujemy CAŁĄ zawartość projektu
# (Upewnij się, że masz folder public lub src, gdzie jest index.html)
COPY . .

# 3. Informujemy Dockera o porcie
EXPOSE 3000

# 4. Odpalamy serwer
CMD ["node", "server.js"]
