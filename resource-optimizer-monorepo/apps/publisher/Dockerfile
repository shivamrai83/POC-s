# Dockerfile for Invoice App
FROM node:18-alpine
WORKDIR /usr/src/app
COPY ../../package*.json ./
COPY ../../pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build invoice
EXPOSE 3001
CMD ["node", "dist/apps/invoice/main.js"] 