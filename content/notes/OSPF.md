---
title: OSPF
date created: 2022-12-24 21:18
date updated: 2022-12-25 00:03
---

WIP

# Link-state routing protocols

Routers in a link-state routing protocol exchange information about the state of their own links via a process known as link-state advertising. Each router broadcasts to all other routers in the network a link-state advertisement (LSA) containing information about the state of its own links.

The LSA includes the following information:

- The router's ID: This is a unique identifier for the router.
- The links or neighbors the router is connected to: This includes the destination of the link, the cost or metric of the link, and the status of the link (up or down).
- The sequence number: This is a number that indicates the age of the LSA. The router increments the sequence number each time it sends an updated LSA.

When a router receives an LSA from another router, it stores the information in its own link-state database and sends a copy to all of its neighbors. This procedure is repeated until all routers in the network have received the LSA and updated their link-state databases.

The topological map of the entire network is stored in the link-state database, which the router uses to calculate the shortest path to a destination using a routing algorithm. The topological map is used to calculate the shortest path between any two points in the network using a routing algorithm, such as Dijkstra's algorithm. This allows the router to determine the best path to send data packets to their destination.

Although link-state routing protocols are more complex and resource-intensive than distance-vector routing protocols, they have several advantages. They provide more accurate and up-to-date network information, allowing for more efficient routing. They also enable the creation of hierarchical networks, in which the network is divided into smaller sections and only the links between these sections are exchanged between routers, reducing the amount of information exchanged and increasing efficiency.

One example of a link-state routing protocol is Open Shortest Path First (OSPF).

# Open Shortest Path First (OSPF)

## OSPF Packet Types

Open Shortest Path First (OSPF) is a link-state routing protocol that exchanges information between routers using five different types of protocol packets or messages. These packets are:

1. Hello: The Hello packet is used by routers to establish and maintain neighbor relationships. It is sent on a regular basis to all of a router's neighbors to confirm that the link is still active and to negotiate OSPF connection parameters such as the router's ID and the area it belongs to.

2. Database Description (DD): The DD packet is used by routers to exchange link-state information. A router sends it to its neighbors in order to describe the contents of its link-state database. This information is then used by the neighbors to update their own link-state databases.

3. Link-State Request (LSR): The LSR packet is used to ask a neighbor for specific pieces of link-state information. If a router's link-state database is missing some information, it can send an LSR to request the missing data.

4. Link-State Update (LSU): The LSU packet is used to send link-state information to a neighbor. It is sent in response to an LSR or as part of the routers' regular exchange of link-state information.

5. Link-State Acknowledgment (LSAck): The LSAck packet is used to acknowledge the receipt of an LSU. A router sends it to the LSU sender to confirm that the link-state information was received and processed correctly.

These five types of OSPF packets are used to establish and maintain neighbor relationships, exchange link-state information, and ensure the link-state database's accuracy and reliability.

## OSPF Entries

In Open Shortest Path First (OSPF), there are three types of entries or tables that are used to store information about the network. These tables are:

1. Router table: The router table, also known as the forwarding table, stores information about all known network destinations' routes. It is used by the router to determine the next hop for a forwarded packet. The router table is filled with data from the link-state database.![[notes/assets/img/O_Pasted image 20221224185350.png]]

2. Link-state database: The link-state database stores a detailed representation of the entire network, including information about the links and neighbors of each router, as well as the cost or metric of each link. The link-state database is populated using link-state advertisements (LSAs) received from other routers. `display ospf lsdb` command to view lsdb information.![[notes/assets/img/O_Pasted image 20221224185330.png]]

3. Neighbor table: The neighbor table stores data about the routers that are directly connected to the local router. It contains the router's ID, the link to the neighbor, and the neighbor's status (up or down). The neighbor table is used to keep track of neighbors and exchange link-state information with other routers. `display ospf peer` command to view status information.![[notes/assets/img/O_Pasted image 20221224185301.png]]

These three tables are used by OSPF routers to exchange information about the network and determine the best route for forwarding packets to their destination.

## Establishing OSPF adjacency

Routers discover each other by exchanging Hello packets. When a router receives a Hello packet from a neighbor, it adds the neighbor to its neighbor table and replies with another Hello packet. This establishes the two routers' neighbor relationship. They negotiate which router will be the master and which will be the slave. The master router initiates the exchange of link-state information, while the slave router responds to information requests.

The role of master or slave is determined based on the following criteria:

1. Router ID: The router with the highest Router ID becomes the master. The Router ID is a unique identifier for each router, and it is determined by the highest IP address of the router's active interfaces.

2. Priority: If the Router IDs are the same, the router with the highest priority becomes the master. The priority is a value between 0 and 255 that can be manually configured on each router. If the priorities are also the same, both routers become masters.

After establishing a neighbor relationship, the routers begin exchanging link-state information. A Database Description (DD) packet is sent from one router to the other, describing the **summary** of contents of its link-state database. The other router then sends a Link-State Request (LSR) packet to inquire about any missing data. The first router responds with the requested information in the form of a Link-State Update (LSU) packet. After that, the other router sends LSAck to confirm receipt of the LSU. This process is repeated until each router has a complete copy of the other's link-state database.

Both routers are considered fully adjacent once they have a complete copy of each other's link-state database. They can then exchange routing information and forward packets to one another.

![[notes/assets/img/O_Pasted image 20221224191057.png]]

## DR and BDR

In Open Shortest Path First (OSPF), the Designated Router (DR) and the Backup Designated Router (BDR) are special roles that are used to reduce the amount of link-state information that is exchanged between routers in a multi-access network, such as a LAN.

A multi-access network is a type of network where multiple devices are connected to the same physical link, such as a Ethernet switch. In a multi-access network, all the routers are connected to the same broadcast domain, and they can all send and receive packets to and from any other device on the network.

In OSPF, the DR and BDR are responsible for exchanging link-state information with the other routers in the network. This reduces the amount of link-state information that needs to be exchanged, as the other routers only need to exchange information with the DR and BDR, rather than with every other router on the network.

The DR is the primary router responsible for exchanging link-state information, while the BDR is a backup router that takes over if the DR fails. The DR and BDR are elected by the routers in the network based on their Router IDs and priorities. The router with the highest Router ID becomes the DR, and the router with the next highest Router ID becomes the BDR. If the Router IDs are the same, the router with the highest priority becomes the DR. If the priorities are also the same, both routers become DRs.

In summary, the DR and BDR are special roles in OSPF that are used to reduce the amount of link-state information exchanged in a multi-access network. The DR is the primary router responsible for exchanging link-state information, while the BDR is a backup router that takes over if the DR fails. The DR and BDR are elected by the routers in the network based on their Router IDs and priorities.

## Multi Area OSPF

In Open Shortest Path First (OSPF), a multi-area network is a network that is divided into multiple areas, with each area containing a collection of networks and routers that are connected by a common **area border router (ABR)**. This allows for more efficient routing within the OSPF network, as routers within the same area exchange information about the state of their own links and do not need to exchange information about links in other areas.

Each area in a multi-area OSPF network is given a unique area ID, which is used to identify the area in the link-state database. The ABR is in charge of connecting the area to the rest of the network and exchanging link-state information with other areas.

In the form of a summary LSA, the ABR sends a summary of the link-state information for the area to the other areas. This allows the other areas to get a high-level view of the networks in the area without having to keep detailed information about every link and router.

The ABR also maintains a link-state database for the entire network, which includes information about the links and routers in all the areas. This allows the ABR to route packets between areas and to calculate the shortest path between any two points in the network.

Multi-area OSPF provides several benefits, including improved scalability and reduced network traffic. It also allows for the creation of a hierarchical network structure, which can make it easier to manage and troubleshoot the network.
