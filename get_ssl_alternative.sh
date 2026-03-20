#!/bin/bash

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

domains=(cinestream.id.vn www.cinestream.id.vn)
rsa_key_size=4096
data_path="./nginx/certbot"
email="truongtuanvu2304@gmail.com" # Thay đổi thành email của bạn
staging=0 # Đổi thành 1 để test

if [ -d "$data_path/conf/live/${domains[0]}" ]; then
  read -p "Chứng chỉ cũ đã tồn tại cho ${domains[0]}. Bạn có muốn ghi đè lên không? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Tải về các file cấu hình SSL khuyên dùng cho Nginx..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nodejs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo ""
fi

# --- ZeroSSL EAB Credentials ---
# Bạn cần đăng ký tài khoản tại ZeroSSL.com, vào Developer -> EAB Credentials để lấy 2 mã này.
EAB_KID="XKS2u3nR5FQ0sH-uEH-g3A" 
EAB_HMAC_KEY="mqNthQEmCY4VKweGiy9Ongxa4gmHVDk5P817tqaSmFk2TxYrszT3Cj8AO19Mkat2Nvqitssv2xsPRIel3zg9ow"
# -------------------------------

if [ -z "$EAB_KID" ] || [ -z "$EAB_HMAC_KEY" ]; then
  echo "LỖI: Bạn chưa điền EAB_KID và EAB_HMAC_KEY trong script."
  echo "Vui lòng lấy chúng từ ZeroSSL dashboard (Developer/API section)."
  exit 1
fi

echo "### Tạo chứng chỉ SSL giả (dummy) cho ${domains[0]}..."
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Khởi động Nginx (với chứng chỉ giả)..."
docker compose up --force-recreate -d nginx
sleep 2 # Chờ Nginx khởi động
echo

echo "### Yêu cầu chứng chỉ thực từ ZeroSSL..."
# Sử dụng ZeroSSL thay vì Let's Encrypt hoặc Buypass
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# ZeroSSL ACME server
acme_server="https://acme.zerossl.com/v2/DV90"

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $domain_args \
    --server $acme_server \
    --eab-kid $EAB_KID \
    --eab-hmac-key $EAB_HMAC_KEY \
    --email $email \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

if [ $? -eq 0 ]; then
    echo "### Thành công! Đang tải lại Nginx..."
    docker compose exec nginx nginx -s reload
else
    echo "### THẤT BẠI: Không thể lấy chứng chỉ thực."
    echo "Nginx vẫn đang chạy với chứng chỉ giả để tránh lỗi hệ thống."
    echo "Vui lòng kiểm tra lại DNS hoặc EAB credentials."
fi
