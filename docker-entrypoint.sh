#!/bin/bash

# Run migrations
echo "RUNNING MIGRATIONS"
npm run typeorm:migration:run

# Start the app
echo "RUNNING APP"
npm run start:dev