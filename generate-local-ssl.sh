#!/bin/bash

CERT_PATH="./nginx/certbot/conf/live/localhost"

if [ ! -d "$CERT_PATH" ]; then
    mkdir -p "$CERT_PATH"
    echo "Created directory: $CERT_PATH"
else
    echo "Directory already exists: $CERT_PATH"
fi

echo "Generating self-signed SSL certificate for localhost using Docker..."
docker run --rm -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/letsencrypt/live/localhost/privkey.pem -out /etc/letsencrypt/live/localhost/fullchain.pem -subj "/CN=localhost"

echo "Done! You can now run 'docker-compose up -d'."
