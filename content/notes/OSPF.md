---
date created: 2022-12-24 21:18
date updated: 2022-12-24 21:18
---

WIP

# Link-state routing protocols

In a link-state routing protocol, routers exchange information about the state of their own links through a process called link-state advertising. Each router sends a link-state advertisement (LSA) to all other routers in the network, which contains information about the state of its own links.

The LSA includes the following information:

- The router's ID: This is a unique identifier for the router.
- The links or neighbors the router is connected to: This includes the destination of the link, the cost or metric of the link, and the status of the link (up or down).
- The sequence number: This is a number that indicates the age of the LSA. The router increments the sequence number each time it sends an updated LSA.

When a router receives an LSA from another router, it adds the information to its own link-state database and sends a copy of the LSA to all of its own neighbors. This process continues until all routers in the network have received the LSA and have updated their link-state databases.

The link-state database contains the topological map of the entire network, which the router uses to calculate the shortest path to a destination using a routing algorithm. Link-state protocols are generally considered to be more accurate and efficient than distance-vector protocols because they provide more detailed and up-to-date information about the network.

The topological map is used to calculate the shortest path between any two points in the network using a routing algorithm, such as Dijkstra's algorithm. This allows the router to determine the best path to send data packets to their destination.

Link-state routing protocols are generally more complex and require more resources than distance-vector routing protocols, but they offer several advantages. They provide more accurate and up-to-date information about the network, which allows for more efficient routing. They also allow for the creation of hierarchical networks, where the network is divided into smaller areas and only the links between these areas are exchanged between routers, reducing the amount of information exchanged and increasing efficiency.

One example of a link-state routing protocol is Open Shortest Path First (OSPF).

# Open Shortest Path First (OSPF)

## OSPF Packet Types

Open Shortest Path First (OSPF) is a link-state routing protocol that uses five different types of protocol packets or messages to exchange information between routers. These packets are:

1. Hello: The Hello packet is used to establish and maintain neighbor relationships between routers. It is sent periodically to all of a router's neighbors to confirm that the link is still active and to negotiate the parameters of the OSPF connection, such as the router's ID and the area it belongs to.

2. Database Description (DD): The DD packet is used to exchange link-state information between routers. It is sent by a router to its neighbors to describe the contents of its link-state database. The neighbors then use this information to update their own link-state databases.

3. Link-State Request (LSR): The LSR packet is used to request specific pieces of link-state information from a neighbor. If a router is missing some information in its link-state database, it can send an LSR to request the missing information.

4. Link-State Update (LSU): The LSU packet is used to send link-state information to a neighbor. It is sent in response to an LSR or as part of the regular exchange of link-state information between routers.

5. Link-State Acknowledgment (LSAck): The LSAck packet is used to acknowledge the receipt of an LSU. It is sent by a router to the sender of the LSU to confirm that the link-state information was received and processed correctly.

These five types of OSPF packets are used to establish and maintain neighbor relationships, exchange link-state information, and ensure the accuracy and reliability of the link-state database.

## OSPF Entries

In Open Shortest Path First (OSPF), there are three types of entries or tables that are used to store information about the network. These tables are:

1. Router table: The router table, also known as the forwarding table, stores information about the routes to all known destinations in the network. It is used by the router to determine the next hop for a packet being forwarded. The router table is populated using the information in the link-state database. `display ospf routing` command to view routing information.![[notes/assets/img/Pasted image 20221224185350.png]]

2. Link-state database: The link-state database stores a detailed representation of the entire network, including information about the links and neighbors of each router, as well as the cost or metric of each link. The link-state database is populated using link-state advertisements (LSAs) received from other routers. `display ospf lsdb` command to view lsdb information.![[notes/assets/img/Pasted image 20221224185330.png]]

3. Neighbor table: The neighbor table stores information about the routers that are directly connected to the local router. It includes the router's ID, the link to the neighbor, and the status of the neighbor (up or down). The neighbor table is used to maintain neighbor relationships and exchange link-state information with other routers. `display ospf peer` command to view status information.![[notes/assets/img/Pasted image 20221224185301.png]]

These three tables are used by OSPF routers to exchange information about the network and determine the best route for forwarding packets to their destination.

## Establishing OSPF adjacency

Routers discover each other through the exchange of Hello packets. When a router receives a Hello packet from a neighbor, it adds the neighbor to its neighbor table and sends a Hello packet back. This establishes a neighbor relationship between the two routers. They negotiate a role to determine which router will be the master and which will be the slave. The master router is responsible for initiating the exchange of link-state information, while the slave router responds to requests for information.

The role of master or slave is determined based on the following criteria:

1. Router ID: The router with the highest Router ID becomes the master. The Router ID is a unique identifier for each router, and it is chosen based on the highest IP address of the router's active interfaces.

2. Priority: If the Router IDs are the same, the router with the highest priority becomes the master. The priority is a value between 0 and 255 that can be manually configured on each router. If the priorities are also the same, both routers become masters.

Once a neighbor relationship has been established, the routers begin exchanging link-state information. One router sends a Database Description (DD) packet to the other, describing the **summary** of contents of its link-state database. The other router then sends a Link-State Request (LSR) packet to request any missing information. The first router responds with a Link-State Update (LSU) packet containing the requested information. The other router then sends LSAck to confirm it received the LSU. This process continues until both routers have a complete copy of each other's link-state database.

Once both routers have a complete copy of each other's link-state database, they are considered to be fully adjacent. They can then begin exchanging routing information and forwarding packets to each other.

![[notes/assets/img/Pasted image 20221224191057.png]]

## DR and BDR

In Open Shortest Path First (OSPF), the Designated Router (DR) and the Backup Designated Router (BDR) are special roles that are used to reduce the amount of link-state information that is exchanged between routers in a multi-access network, such as a LAN.

A multi-access network is a type of network where multiple devices are connected to the same physical link, such as a Ethernet switch. In a multi-access network, all the routers are connected to the same broadcast domain, and they can all send and receive packets to and from any other device on the network.

In OSPF, the DR and BDR are responsible for exchanging link-state information with the other routers in the network. This reduces the amount of link-state information that needs to be exchanged, as the other routers only need to exchange information with the DR and BDR, rather than with every other router on the network.

The DR is the primary router responsible for exchanging link-state information, while the BDR is a backup router that takes over if the DR fails. The DR and BDR are elected by the routers in the network based on their Router IDs and priorities. The router with the highest Router ID becomes the DR, and the router with the next highest Router ID becomes the BDR. If the Router IDs are the same, the router with the highest priority becomes the DR. If the priorities are also the same, both routers become DRs.

In summary, the DR and BDR are special roles in OSPF that are used to reduce the amount of link-state information exchanged in a multi-access network. The DR is the primary router responsible for exchanging link-state information, while the BDR is a backup router that takes over if the DR fails. The DR and BDR are elected by the routers in the network based on their Router IDs and priorities.

## Multi Area OSPF

In Open Shortest Path First (OSPF), a multi-area network is a network that is divided into multiple areas, with each area containing a collection of networks and routers that are connected by a common **area border router (ABR)**. This allows for more efficient routing within the OSPF network, as routers within the same area exchange information about the state of their own links and do not need to exchange information about links in other areas.

In a multi-area OSPF network, each area is assigned a unique area ID, which is used to identify the area in the link-state database. The ABR is responsible for connecting the area to the rest of the network and exchanging link-state information between the area and the other areas.

The ABR sends a summary of the link-state information for the area to the other areas in the form of a summary LSA. This allows the other areas to have a high-level view of the networks in the area, without needing to maintain detailed information about every link and router in the area.

The ABR also maintains a link-state database for the entire network, which includes information about the links and routers in all the areas. This allows the ABR to route packets between areas and to calculate the shortest path between any two points in the network.

Multi-area OSPF provides several benefits, including improved scalability and reduced network traffic. It also allows for the creation of a hierarchical network structure, which can make it easier to manage and troubleshoot the network.
