# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build stage
FROM base AS build
ARG VITE_SITE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL

COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Production stage
FROM base AS release
WORKDIR /app

# Copy production dependencies
COPY --from=install /temp/prod/node_modules node_modules

# Copy built frontend assets
COPY --from=build /app/dist ./dist

# Copy server code
COPY --from=build /app/src/server ./src/server

# Copy public folder (needed for file system API)
COPY --from=build /app/public ./public

# Copy package metadata
COPY package.json .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use a non-root user
USER bun

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "bun", "src/server/index.ts" ]
