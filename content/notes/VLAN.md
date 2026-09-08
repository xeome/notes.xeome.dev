---
title: VLAN
date created: 2022-12-24 21:44
date updated: 2022-12-25 00:12
---

A virtual LAN (VLAN) is a logical grouping of devices in a computer network that behaves as if they are part of the same LAN, despite the fact that the devices are physically connected to different switches or located in different parts of the network. VLANs are used to divide a network into smaller, more manageable segments, as well as to improve network performance and security. This is accomplished by allocating a VLAN to each device and configuring the switch to forward traffic between devices in the same VLAN.

VLANs are commonly used to divide a network into different subnets or broadcast domains, which can be useful for distinguishing between different types of traffic, such as guest and corporate traffic, or for isolating different departments or teams within an organization. VLANs can also be used to improve network security by limiting the scope of broadcasts and limiting access to specific network areas.

VLANs are implemented through VLAN tagging, which adds a VLAN identifier to the header of a packet as it travels across the network. This enables switches to determine which VLAN a packet belongs to and forward it to the appropriate devices. Most modern networking devices, including switches, routers, and network interface cards, support VLAN tagging (NICs).

# VLAN interface types

There are several types of layer 2 interfaces that can be used in a virtual LAN (VLAN), including:

1. Access ports: An access port is a layer 2 interfaces that are configured to belong to a single VLAN. All traffic sent or received on an access port is associated with the VLAN to which the port is assigned. Access ports are typically used to connect end devices to the network, such as computers and servers.

2. Trunk ports: Trunk ports are layer 2 interfaces that are configured to carry traffic from multiple VLANs. Trunk ports use VLAN tagging to determine which VLAN each packet belongs to and to route the packet to the correct VLAN. Trunk ports are commonly used to connect switches to one another or to connect a switch to a router or other network device.

3. Hybrid ports: A hybrid port is a layer 2 interface that, depending on the configuration, can function as either an access port or a trunk port. Hybrid ports are useful when the VLAN configuration needs to be changed or when a device needs to be connected to multiple VLANs at the same time.
