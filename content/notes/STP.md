---
title: STP
date created: 2022-12-25 20:49
date updated: 2023-01-21 23:31
---

# Overview

Spanning Tree Protocol (STP) is a network protocol that ensures an Ethernet network has a loop-free topology. STP is used to prevent network loops, which can occur when two devices on a network have multiple paths. Broadcast storms can be caused by network loops, which can severely degrade network performance and even bring the network down.

STP selects a single path between two devices and blocks all other paths. STP will unblock one of the blocked paths and use it as the active path if the primary path fails. This ensures that only one active path exists between two devices, preventing loops from forming.

STP uses a tree-based algorithm to determine the best path between two devices and is based on the IEEE 802.1D standard. It determines the best path using a set of parameters, including the cost of the link and the port identifier. STP is implemented in switches and is transparent to end devices, which means it operates behind the scenes and does not require any end-user configuration.

# Root Bridge Selection

Spanning Tree Protocol (STP) is a networking protocol that is used to prevent loops in a network by selecting a root bridge (also called a root switch) and blocking unnecessary links. The root bridge is the central reference point in the network, and all other switches in the network determine their position relative to the root bridge.

The root bridge is selected based on the bridge identifier (BID), which consists of a priority value and the MAC address of the switch. The priority value is a numerical value that can be manually configured on each switch, and the MAC address is a unique identifier that is assigned to each switch. By default, the switch with the lowest priority value becomes the root bridge. If multiple switches have the same priority, the switch with the lowest MAC address becomes the root bridge.

Once the root bridge is selected, the root path cost is calculated for each switch. The root path cost is the total cost of the path from the root bridge to the switch. The cost is determined based on the speed of the link and the type of network media being used. The switch with the lowest root path cost becomes the root port for each switch, which is the port that is used to forward traffic to the root bridge.

# Root Port and Designated Port

The port identifier (PID) is a value that is used to identify and manage the ports on a switch. The PID consists of a priority value and the port number, and it is used by the switch to determine the root port and the designated port for each switch.

The priority value is a numerical value that can be manually configured on each port, and it is used to determine the root port and the designated port for each switch. The port with the lowest priority becomes the root port and the designated port for the switch. If multiple ports have the same priority, the port with the lowest port number becomes the root port and the designated port.

A **designated port** is a port on a switch that is connected to the segment with the lowest-cost path to the root bridge. It is responsible for forwarding traffic on that segment and is in a forwarding state. Only one port on a switch can be the designated port for a specific segment.

A **root port** is a port on a switch that has the lowest-cost path to the root bridge. It is responsible for forwarding traffic from the switch to the root bridge and is in a forwarding state. Each switch in the network has one and only one root port.

# Bridge Protocol Data Unit (BPDU)

A Bridge Protocol Data Unit (BPDU) is a message that is used to exchange information between switches and to establish the root bridge and root port for each switch. BPDUs are sent between switches on a regular basis, and they contain information about the switch, such as the switch's MAC address and the switch's port identifier (PID).

When a switch receives a BPDU from another switch, it compares the information in the BPDU with the information in its own BPDUs to determine the root bridge and root port for the network. The switch with the lowest PID becomes the root bridge, and the port with the lowest PID becomes the root port for each switch.

## BPDU types

There are two types of Bridge Protocol Data Units (BPDUs): Configuration BPDUs and Topology Change Notification (TCN) BPDUs.

Configuration BPDUs are used to exchange information about the switches in the network and to establish the root bridge and root port for each switch. They are sent on a regular basis to ensure that the spanning tree is up-to-date and to prevent loops in the network. Configuration BPDUs contain information about the switch, such as the switch's MAC address, the switch's port identifier (PID), and the switch's path cost.

Topology Change Notification (TCN) BPDUs are used to inform other switches in the network of a change in the network topology. They are sent by the switch that detects the change, and they are used to trigger a reconfiguration of the spanning tree. TCN BPDUs are used to ensure that the spanning tree remains up-to-date and to prevent loops in the network.

# Port states

In Spanning Tree Protocol (STP), there are five port states that a port can be in:

1. Disabled: Not participating in traffic forwarding, not receiving or sending any traffic. Typically used for administrative purposes like configuration or troubleshooting.

2. Blocking: Not forwarding traffic, only allowing STP BPDUs to prevent loops in the network by ensuring only one active path between any two points.

3. Listening: Preparing to forward traffic, and it listens for BPDUs to ensure that the network is stable. The port blocks all incoming traffic except for STP BPDUs and sends BPDUs to confirm the network topology.

4. Learning: The port does not forward frames but can receive and process frames. The port is learning the MAC addresses of devices connected to the network.

5. Forwarding: Actively forwarding traffic and participating in normal network operation, accepting and forwarding all incoming traffic. Only the root port or designated port can enter Forwarding state.

## STP State Transition Timing

STP uses a timer-based mechanism to transition between states. The following are the default timer values for each state transition:

- **Blocking to Listening**: 15 seconds
- **Listening to Learning**: 15 seconds
- **Learning to Forwarding**: 15 seconds

Once the network has converged, the STP algorithm will continuously monitor the network for changes. In case of a topology change, the STP will re-converge, which can take from 50 to 60 seconds.

## Rapid Spanning Tree Protocol (RSTP)

Rapid Spanning Tree Protocol (RSTP) is an evolution of STP that improves the convergence time of the network after a topology change. RSTP uses a more efficient negotiation process to determine the root bridge and active paths in the network. This results in faster convergence times, typically within 2-3 seconds. RSTP has only three port states: Discarding, Learning, and Forwarding. This reduction in states allows ports to transition to the forwarding state more quickly compared to normal STP.
