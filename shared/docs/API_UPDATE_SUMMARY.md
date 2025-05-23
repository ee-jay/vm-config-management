# API Update Summary - March 19, 2024

## Overview

This document summarizes the changes made to update the API endpoints and containerize the Node.js application.

## Key Changes

### 1. API Endpoint Updates

- Modified all API endpoints in `script.js` to use `/api/` prefix
- Updated endpoints include:
  - `/api/vendors`
  - `/api/accounts`
  - `/api/submit-po`
  - `/api/updateVendorData`
  - `/api/orders`
- Renamed and updated `createIIF.js` to use new API endpoints

### 2. Node.js Containerization

- Created new `Dockerfile` in `purchase_order_app/` directory
- Configured Node.js application to run in container
- Updated database connection settings in `server.js`
- Set up proper environment variables for container

### 3. Nginx Configuration

- Updated nginx configuration to properly proxy API requests
- Added location blocks for `/api/` endpoints
- Configured proper upstream to Node.js container

### 4. Testing Results

- Vendor list loads correctly
- Account dropdowns populate successfully
- Vendor selection works as expected
- Form generation functioning properly
- IIF file generation working

## How to Restart the Node.js Container

To restart the Node.js application, you can use any of these methods:

1. Restart the specific container:

```bash
docker restart poserver-nodejs-1
```

2. Restart all containers:

```bash
cd /opt && docker compose down && docker compose up -d
```

3. View container logs:

```bash
docker logs poserver-nodejs-1
```

4. Execute Node.js directly in the container (useful for debugging):

```bash
docker exec -it poserver-nodejs-1 node server.js
```

## File Changes

- Modified: `script.js`
- Modified: `purchase_order_app/server.js`
- Added: `purchase_order_app/Dockerfile`
- Renamed/Updated: `purchase_order_app/createIFF.js`

## Notes

- All API endpoints now use the `/api/` prefix for consistency
- Node.js application runs in its own container
- Nginx handles all routing and static file serving
- Database connection is configured via environment variables
