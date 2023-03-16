---
title: Setting up Cockpit with caddy reverse proxy
date created: 2023-03-16 01:02
date updated: 2023-03-16 12:33
---

Cockpit is a web-based server management tool that provides a user-friendly interface for administrators to manage their servers. In this article, we will walk through the process of setting up Cockpit with Caddy reverse proxy.

# Prerequisites

Before we begin, make sure that you have the following:

- Cockpit installed on the server
- Caddy installed on the server (<https://caddyserver.com/docs/install>)
- A domain name pointing to your server's IP address

# Step 1: Setup SSL Certificates

You can follow the steps for obtaining certificates in [[notes/Cockpit nginx reverse proxy]]
Put the certificates to a different location, i.e. `/etc/caddy/certs`
Make sure the folder is owned by caddy user if you get permission errors.

# Step 2: Setting Up Caddy

Create a new Caddyfile in your server's configuration directory (usually `/etc/caddy/`). This file will define the reverse proxy rules for Caddy.

In the Caddyfile, add the following lines to define a reverse proxy rule for your Cockpit panel:

```nginx
panel.example.com {
        reverse_proxy localhost:9090 {
                header_up Host {host}
                header_up X-Real-IP {remote}
        }

        tls /etc/caddy/certs/fullchain.pem /etc/caddy/certs/privkey.pem
}
```

The `header_upstream` lines are optional, but they can help ensure that the backend server (Cockpit) receives the correct information about the incoming request.

Save the Caddyfile and restart Caddy to apply the changes. You can use the following command to restart Caddy:

```bash
sudo systemctl restart caddy
```

# Step 3: Make Cockpit proxy aware

<https://github.com/cockpit-project/cockpit/wiki/Proxying-Cockpit-over-nginx#make-cockpit-proxy-aware>

# See Also

- <https://github.com/caddyserver/caddy>
