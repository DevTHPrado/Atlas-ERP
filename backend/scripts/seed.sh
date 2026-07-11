#!/bin/bash
# Run database seeds
set -e
echo "Running database seeds..."
python -m app.seeds
echo "Seeds completed."
