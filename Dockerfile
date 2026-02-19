# ---- Build Stage ----
FROM node:24-bookworm-slim AS builder

# Install build tools for native modules (bcrypt, node-zstd, fast-zlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and patches for better layer caching
COPY package.json package-lock.json ./
COPY patches/ patches/

# Install all dependencies (postinstall runs patch-package automatically)
RUN npm ci

# Copy source code and build assets
COPY tsconfig.json ./
COPY src/ src/
COPY assets/ assets/
COPY scripts/ scripts/

# Build the project (tsc + generate schemas + generate openapi)
RUN npm run build

# Prune dev dependencies for production
RUN npm prune --omit=dev

# ---- Production Stage ----
FROM node:24-bookworm-slim

WORKDIR /app

# Copy built output and production dependencies from builder
COPY --from=builder /app/dist/ dist/
COPY --from=builder /app/node_modules/ node_modules/
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/assets/ assets/

# Create files directory for CDN storage (mountable as a volume)
RUN mkdir -p /app/files

ENV NODE_ENV=production

# Railway injects PORT automatically; default to 3001 as fallback
EXPOSE ${PORT:-3001}

# Bundle mode: runs API + CDN + Gateway in a single process
CMD ["node", "--enable-source-maps", "dist/bundle/start.js"]
