# ── Stage 1: Build frontend ──────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production server ───────────────────────────
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S odop && adduser -S odop -u 1001

# Backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Backend source
COPY backend/ ./backend/

# Frontend build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create uploads directory and make startup script executable
RUN mkdir -p /app/backend/uploads /app/backend/uploads/img-cache && \
    chmod +x /app/backend/start.sh && \
    chown -R odop:odop /app

USER odop

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["/bin/sh", "/app/backend/start.sh"]
