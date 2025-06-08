#!/bin/bash

# This script is designed to run tests in a CI/CD environment.

# Exit immediately if a command exits with a non-zero status
set -e

# Run Jest tests with coverage
npm run test -- --coverage

# Optionally, you can add additional commands here for further CI/CD integration
# For example, you might want to lint your code or run other scripts

echo "Tests completed successfully."