$cert_path = ".\nginx\certbot\conf\live\localhost"
if (-not (Test-Path $cert_path)) {
    New-Item -ItemType Directory -Force -Path $cert_path | Out-Null
    Write-Host "Created directory: $cert_path"
} else {
    Write-Host "Directory already exists: $cert_path"
}

Write-Host "Generating self-signed SSL certificate for localhost using Docker..."
docker run --rm -v ${PWD}\nginx\certbot\conf:/etc/letsencrypt alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/letsencrypt/live/localhost/privkey.pem -out /etc/letsencrypt/live/localhost/fullchain.pem -subj "/CN=localhost"

Write-Host "Done! You can now run 'docker-compose up -d'."
