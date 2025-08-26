# Build arguments
ARG SOURCE_CODE=.

# Use ubi9/nodejs-20 as default base image
ARG BASE_IMAGE="registry.access.redhat.com/ubi9/nodejs-20:latest"

FROM ${BASE_IMAGE}

## Build args to be used at this step
ARG SOURCE_CODE

WORKDIR /usr/src/app

## Copying in source code
COPY --chown=default:root ${SOURCE_CODE} /usr/src/app

# Change file ownership to the assemble user
USER default

# Clean npm cache
RUN npm cache clean --force

# Install dependencies at root level (this will install frontend and backend via postinstall)
RUN npm ci --omit=optional --ignore-scripts

# Install frontend and backend dependencies
RUN cd frontend && npm ci --omit=optional --ignore-scripts
RUN cd backend && npm ci --omit=optional --ignore-scripts

# Create logs directory
RUN mkdir -p /usr/src/app/logs && chmod 775 /usr/src/app/logs

# Set up environment for development
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set development server configuration
ENV ODH_HOST=0.0.0.0
ENV ODH_PORT=3000
ENV BACKEND_PORT=8080

# For external cluster development
ENV EXT_CLUSTER=true
ENV LOCAL_K8S=true

# Expose ports for frontend dev server and backend
EXPOSE 3000 8080

# Create startup script to run both frontend and backend
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting RHOAI Dashboard in development mode..."\n\
\n\
# Start backend in background\n\
echo "Starting backend server on port 8080..."\n\
cd /usr/src/app/backend && npm run start:dev &\n\
BACKEND_PID=$!\n\
\n\
# Start frontend\n\
echo "Starting frontend development server on port 3000..."\n\
cd /usr/src/app/frontend && npm run start:dev:ext &\n\
FRONTEND_PID=$!\n\
\n\
# Wait for both processes\n\
wait $BACKEND_PID $FRONTEND_PID\n\
' > /usr/src/app/start-dev.sh && chmod +x /usr/src/app/start-dev.sh

CMD ["/usr/src/app/start-dev.sh"]

LABEL io.opendatahub.component="odh-dashboard" \
      io.k8s.display-name="odh-dashboard-dev" \
      name="open-data-hub/odh-dashboard-dev" \
      summary="odh-dashboard-development" \
      description="Open Data Hub Dashboard - Development Mode"