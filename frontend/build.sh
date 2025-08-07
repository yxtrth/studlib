#!/bin/bash

# Frontend build script for Netlify
echo "Building Student Library Frontend..."

# Install dependencies
npm ci

# Build the React application
npm run build

echo "Frontend build completed successfully!"
