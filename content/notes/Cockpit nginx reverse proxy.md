---
title: Setting up Cockpit with nginx reverse proxy
date created: 2023-03-06 15:01
date updated: 2023-03-16 12:32
---

Cockpit is a web-based server management tool that provides a user-friendly interface for administrators to manage their servers. In this article, we will walk through the process of setting up Cockpit with Nginx reverse proxy.

# Prerequisites

Before we begin, make sure that you have the following:

- Cockpit installed on the server
- Nginx installed on the server
- A domain name pointing to your server's IP address

# Step 1: Setup SSL Certificates

First, we need to obtain SSL certificates for our domain name. We will use Certbot to obtain SSL certificates. Run the following command to obtain SSL certificates for your domain name.

```bash
sudo certbot certonly --manual --preferred-challenges=dns -d "*.example.com" -d "example.com"
```

Make sure to replace `example.com` with your domain name.

Next, we need to create a directory to store our SSL certificates. Run the following command to create a directory named `ssl` in the `/etc/nginx/` directory.

```bash
sudo mkdir /etc/nginx/ssl
```

Copy the SSL certificates to the newly created `ssl` directory using the following commands.

```bash
sudo cp /etc/letsencrypt/live/example.com-0001/fullchain.pem /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/example.com-0001/privkey.pem /etc/nginx/ssl
```

Make sure to replace `example.com` with your domain name.

# Step 2: Setting Up Nginx

Now, we need to create an Nginx configuration file for Cockpit. Run the following command to create a new file named `cockpit.conf` in the `/etc/nginx/sites-available/` directory.

```bash
sudo nvim /etc/nginx/sites-available/cockpit.conf
```

Enter the following configuration into the `cockpit.conf` file.

```hs
server {
    listen 80;
    listen [::]:80;

    server_name panel.example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name panel.example.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;


    location / {
        # Required to proxy the connection to Cockpit
        proxy_pass https://127.0.0.1:9090;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Required for web sockets to function
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

```

We need to modify the Nginx configuration file to enable the Cockpit configuration we just created. Run the following command to edit the `nginx.conf` file.

```bash
sudo nvim /etc/nginx/nginx.conf
```

Add the following line to the `http` block.

```json
include /etc/nginx/sites-enabled/*;
```

Create a symbolic link to the Cockpit configuration file we just created using the following command.

```bash
sudo ln -s /etc/nginx/sites-available/cockpit.conf /etc/nginx/sites-enabled/cockpit
```

Restart the Nginx service to apply the changes we made using the following command.

```bash
sudo systemctl restart nginx
```

# Step 3: Make Cockpit proxy aware

<https://github.com/cockpit-project/cockpit/wiki/Proxying-Cockpit-over-nginx#make-cockpit-proxy-aware>

# See Also

- <https://github.com/cockpit-project/cockpit/wiki/Proxying-Cockpit-over-nginx>
- <https://ryan.lovelett.me/posts/letsencrypt-cockpit/>
