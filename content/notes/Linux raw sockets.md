---
title: Linux raw sockets 
---

> [!warning]
> 
> This post is still in progress. I will update it as soon as I have something to share.

## Introduction

Raw sockets are a type of socket that allows you to access the underlying network protocols directly. This means that you can create your own custom packets and send them over the network. Raw sockets are often used for network analysis, debugging, and security testing. In this post, we will explore how to create and use raw sockets in Linux using the C programming language.

## Creating a raw socket

To create a raw socket in Linux, you need to use the `socket()` system call with the `AF_PACKET` address family and the `SOCK_RAW` socket type.

```c
sockfd = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
if (sockfd < 0) {
    // Error handling
}
```

In the above code snippet, we create a raw socket using the `socket()` system call. The `AF_PACKET` address family specifies that we are creating a raw socket, and the `SOCK_RAW` socket type specifies that we are creating a raw socket that operates at the network layer. The `htons(ETH_P_ALL)` argument specifies that we want to receive all Ethernet packets.

## Binding the raw socket to a network interface

By default, raw sockets are not bound to any network interface. Which means it will receive packets from all network interfaces. If you want to receive packets from a specific network interface, you need to bind the raw socket to that interface.

```c
const struct sockaddr_ll sll = {
    .sll_family = AF_PACKET,
    .sll_protocol = htons(ETH_P_ALL),
    .sll_ifindex = ifindex,
};

if (bind(sockfd, (struct sockaddr *)&sll, sizeof(sll)) < 0) {
    // Error handling
}
```

## Sending and receiving packets

Once you have created and bound the raw socket, you can send and receive packets using the `sendto()` and `recvfrom()` system calls.

```c
// Sending a packet
sendto(sockfd, buffer, length, 0, (struct sockaddr *)&sll, sizeof(sll));

// Receiving a packet
recvfrom(sockfd, buffer, length, 0, NULL, NULL);
```
