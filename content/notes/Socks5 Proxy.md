---
title: Secure SOCKS5 Proxy over SSH and ZeroTier
date created: 2023-01-21 23:37
date updated: 2023-01-21 23:59
---

SOCKS5 is a widely-used proxy protocol that allows for secure and flexible network connections. In this document, I will discuss how I create a secure SOCKS5 proxy over SSH and ZeroTier. ZeroTier is a virtual network that I use to connect different networks together. I personally use this setup to bypass network restrictions. ZeroTier allows me to connect to my RaspberryPI at home without the need for port forwarding or any similar configurations on my router.

## Setting up an SSH Tunnel

This is done by using the `-D` option with the `ssh` command. The `-D` option creates a dynamic tunnel that listens on a specified port on the client machine forwarding all connections to the specified destination.

For example, the following command creates an SSH tunnel that listens on port 1080 on the client machine forwarding all connections to the server on IP address 10.0.0.5:

```c
ssh -D 1080 -f -q -N user@10.0.0.5
```

Rest of the options:
`-f` Requests **ssh** to go to background just before command execution.
`-q` Quiet mode. Causes most warning and diagnostic messages to be suppressed.
`-N` Do not execute a remote command. This is useful for just forwarding ports (protocol version 2 only).

## Setting up a ZeroTier Network

The next step is to set up a [[notes/ZeroTier]] network. ZeroTier is a virtual network that can be used to connect different networks together. It creates a virtual Ethernet switch that can be used to route traffic between different networks.

To set up a ZeroTier network you will need to sign up for a ZeroTier account. Download and install the ZeroTier client on each machine that will be a part of the network and then join the network using network ID. Once the client is installed and the network is joined everyone should be able to communicate with each other as if they were on the same LAN.

## Configuring the SOCKS5 Proxy

With the SSH tunnel and ZeroTier network set up the final step is to configure the SOCKS5 proxy. This can be done by setting the `SOCKS5_PROXY` environment variable to the IP address and port of the SSH tunnel then configuring the application to use the SOCKS5 proxy.

For example, in Linux and macOS, you can set the `SOCKS5_PROXY` environment variable by running the following command:

```
export SOCKS5_PROXY=socks5h://127.0.0.1:1080
```

And then in your application, you can configure it to use the SOCKS5 proxy by specifying the proxy settings, for example in curl you can use `--proxy 'socks5h://localhost:1080'`.

```c
curl --proxy 'socks5h://localhost:1080' -O 'http://example.com/ex.txt'
```

With this configuration, all traffic sent over the SOCKS5 proxy will be securely tunneled over the SSH connection and sent over the ZeroTier network. This allows for secure and flexible communication between networks.
