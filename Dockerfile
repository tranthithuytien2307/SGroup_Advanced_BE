FROM node:20-alpine

WORKDIR /app

# Copy package.json + package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source
COPY src ./src

# Cài TypeScript compiler
RUN npm install -g typescript ts-node

WORKDIR /app/src

EXPOSE 3000

# Chạy trực tiếp index.ts bằng ts-node (hoặc compile trước)
CMD ["ts-node", "index.ts"]
