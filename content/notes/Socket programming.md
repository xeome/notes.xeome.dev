---
title: Socket programming
date created: 2022-12-28 19:13
date updated: 2022-12-28 20:13
---

# Overview

Socket programming is a technique for developing networked applications that use sockets to communicate over a network. A socket is a computer network endpoint for sending and receiving data.

A socket is used by the client and server in socket programming to communicate with each other. The client makes a request to the server, and the server responds with the information requested. This communication can be synchronous (blocking) or asynchronous (non-blocking).

One advantage of socket programming is that it enables the development of networked applications that can communicate with one another regardless of the underlying operating system or hardware platform. This makes it an effective tool for developing distributed systems and applications that can communicate across a wide area network (WAN).

Sockets are classified into two types: stream sockets and datagram sockets. Stream sockets are TCP/IP-based connections that provide a dependable, stream-oriented connection between the client and server. They are appropriate for applications that require consistent data delivery, such as file transfer and email.

Datagram sockets communicate between the client and server using the UDP/IP protocol and are connectionless. They are appropriate for applications that require fast data transmission, such as real-time audio and video streaming, but do not require reliable data delivery.

The first step in creating a socket in a client-server application is to create a socket descriptor with the `socket()` function. This function accepts three arguments: the address family (AF_INET for IPV4 and AF_INET6 for IPV6), the type of socket (SOCK STREAM for stream sockets and SOCK DGRAM for datagram sockets), and the protocol (IPV4 or IPV6) (usually 0, which allows the operating system to choose the appropriate protocol).

Once the socket descriptor has been created, the server must use the `bind()` function to bind the socket to a specific port and address. The client then uses the `connect()` function to connect to the server.

Following the establishment of the connection, the client and server can exchange data using the `send()` and `recv()` functions. When the communication is finished, the client and server should use the `close()` function to close the socket.

Socket programming is a powerful tool for developing networked applications that is used in a wide range of applications and systems. Developers can create robust and scalable network-capable applications with a solid understanding of socket programming and its underlying principles.

# Examples

## Server

```C
#include <arpa/inet.h>  
#include <stdio.h>  
#include <string.h>  
#include <sys/socket.h>  
#include <unistd.h>  
  
// Main function for the server  
int main(int argc, char *argv[]) {  
    int socket_desc, client_sock, c, read_size;  
    struct sockaddr_in server, client;  
    // Initialize the message buffer to 0  
    char client_message[2000] = {0};  
  
    // Create socket  
    socket_desc = socket(AF_INET, SOCK_STREAM, 0);  
    if (socket_desc == -1) {  
        printf("Could not create socket");  
    }    puts("Socket created");  
  
    // Prepare the sockaddr_in structure  
    server.sin_family = AF_INET;  
    server.sin_addr.s_addr = INADDR_ANY;  
    server.sin_port = htons(8888);  
  
    // Bind  
    if (bind(socket_desc, (struct sockaddr *)&server, sizeof(server)) < 0) {  
        // print the error message  
        perror("bind failed. Error");  
        return 1;  
    }    puts("bind done");  
  
    // Listen  
    listen(socket_desc, 3);  
  
    // Accept and incoming connection  
    puts("Waiting for incoming connections...");  
    c = sizeof(struct sockaddr_in);  
  
    // accept connection from an incoming client  
    client_sock =  
        accept(socket_desc, (struct sockaddr *)&client, (socklen_t *)&c);  
    if (client_sock < 0) {  
        perror("accept failed");  
        return 1;  
    }    puts("Connection accepted");  
  
    // Receive a message from client  
    while ((read_size = recv(client_sock, client_message, 2000, 0)) > 0) {  
        // fix garbled message after first message  
        client_message[read_size] = '\0';  
  
        // Echo the message back to the client  
        write(client_sock, client_message, strlen(client_message));  
  
        // Clear the message buffer  
        memset(client_message, 0, 2000);  
    }  
    // Check if client disconnected  
    if (read_size == 0) {  
        puts("Client disconnected");  
        fflush(stdout);  
    }else if (read_size == -1) {  
        perror("recv failed");  
    }  
    return 0;  
}
```

## Client

```C
#include <arpa/inet.h>  
#include <stdio.h>  
#include <string.h>  
#include <sys/socket.h>  
#include <unistd.h>  
  
// Main function for the client  
int main(int argc, char *argv[]) {  
    int sock;  
    struct sockaddr_in server;  
    char message[1000], server_reply[2000];  
  
    // Create socket  
    sock = socket(AF_INET, SOCK_STREAM, 0);  
    if (sock == -1) {  
        printf("Could not create socket");  
    }    puts("Socket created");  
  
    // Prepare the sockaddr_in structure  
    server.sin_addr.s_addr = inet_addr("127.0.0.1");  
    server.sin_family = AF_INET;  
    server.sin_port = htons(8888);  
  
    // Connect to remote server retrying every 5 seconds if connection fails and print status  
    while (connect(sock, (struct sockaddr *)&server, sizeof(server)) < 0) {  
        printf("Connection failed. Retrying in 5 seconds...\n");  
        sleep(5);  
    }  
    puts("Connected\n");  
  
    // keep communicating with server  
    while (1) {  
        // get multiple words input from user  
        printf("Enter message : ");  
        fgets(message, 1000, stdin);  
  
        // Send some data  
        if (send(sock, message, strlen(message), 0) < 0) {  
            puts("Send failed");  
            return 1;  
        }  
        // Clear the message buffer  
        memset(message, 0, 1000);  
  
        // Receive a reply from the server  
        if (recv(sock, server_reply, 2000, 0) < 0) {  
            puts("recv failed");  
            break;  
        }  
        // Print the server's reply  
        printf("Server reply :");  
        puts(server_reply);  
  
        // Clear the message buffer  
        memset(server_reply, 0, 2000);  
    }  
    // close the socket  
    close(sock);  
    return 0;  
}
```
