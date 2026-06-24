FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
  build-essential \
  python3 \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=460
EXPOSE 4000

RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
