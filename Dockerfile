# ETAP 1: Budowanie frontendu (Vite + React + TS)
FROM node:20-alpine AS build-stage
WORKDIR /app

# Kopiujemy pliki zależności (cache-friendly)
COPY package*.json ./
RUN npm install

# Kopiujemy resztę kodu i budujemy statyczne pliki
COPY . .
RUN npm run build

# ETAP 2: Środowisko uruchomieniowe (Node.js)
FROM node:20-alpine
WORKDIR /app

# Instalujemy tylko zależności produkcyjne dla backendu
COPY package*.json ./
RUN npm install --production

# Kopiujemy zbudowany frontend z poprzedniego etapu
# Vite domyślnie buduje do folderu /dist
COPY --from=build-stage /app/dist ./dist

# Kopiujemy pliki backendu (server.js i Twoje serwisy)
COPY server.js ./
COPY services/ ./services/
COPY utils/ ./utils/

# Opcjonalnie: kopiujemy resztę struktury, jeśli masz inne foldery
# COPY models/ ./models/

# Zmienna środowiskowa z compose (PORT=3000)
EXPOSE 3000

CMD ["node", "server.js"]
