#!/bin/bash

# Run this after deploying to production to create the templates table
# Usage: ./scripts/setup-production.sh

echo "Setting up production database..."

# Create templates table
npx tsx --env-file=.env.local scripts/create-templates-table.ts

echo "✅ Production setup complete!"
