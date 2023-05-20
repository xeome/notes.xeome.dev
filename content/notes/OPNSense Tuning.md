---
title: OPNsense Performance Tuning Guide on Proxmox
date created: 2023-05-21 00:10
date updated: 2023-05-21 00:41
---

# Introduction

I will share my experience with tuning the performance of OPNsense, an open source firewall software, running on a Proxmox virtual machine. I encountered throughput issues and spent time researching and testing various settings to achieve optimal performance. Here are the key details and configurations that resolved the speed issues for me. This guide doesn't have technical explanations to why these tunings were made its just for quick reference, you can check out links at bottom "See Also" section for more explanations.

# Configuration Changes (Known Good Configuration):

1. Proxmox Virtual Machine Hardware Settings:

- Used the default i440fx machine type
- Kept CPU type as "KVM64"
- Enabled AES flag for potential VPN performance improvement
- Enabled NUMA flag (no noticeable performance boost)

2. Proxmox Virtual Machine Hardware Settings - Network Adapters:

- Disable firewall processing in Proxmox settings
- Use VirtIO network device type for best performance
- Set Multiqueue to 8 for additional parallel processing

3. OPNsense Interface Settings:

- Disabled all hardware offloading settings.

![[notes/assets/img/Pasted image 20230521002111.png]]

4. OPNsense Tunables (sysctl):

   - Adjusted various sysctl values to optimize performance
   - Here is a list of recommended sysctl tunables for optimizing OPNsense performance (* Means it depends on your hardware config, read bellow):
     - hw.ibrs_disable=1
     - net.isr.maxthreads=-1
     - net.isr.bindthreads=1
     - net.isr.dispatch=deferred
     - net.inet.rss.enabled=1
     - net.inet.rss.bits=6 *
     - kern.ipc.maxsockbuf=16777216 *
     - net.inet.tcp.recvbuf_max=4194304
     - net.inet.tcp.recvspace=262144
     - net.inet.tcp.sendbuf_inc=16384
     - net.inet.tcp.sendbuf_max=4194304
     - net.inet.tcp.sendspace=262144
     - net.inet.tcp.soreceive_stream=1
     - net.pf.source_nodes_hashsize=65536
     - net.inet.tcp.mssdflt=1448
     - net.inet.tcp.abc_l_var=44
     - net.inet.tcp.minmss=536
     - kern.random.fortuna.minpoolsize=64
     - net.isr.defaultqlimit=256
     - vm.pmap.pti=0

#### `net.inet.rss.bits`

> This is a receive side scaling tunable from the same forum thread. I set it to 6 as it seems the optimal value is CPU cores divided by 4. I have 24 cores, so 24/4=6. Your value should be based on the number of CPU cores on your OPNsense virtual machine.

#### `kern.ipc.maxsockbuf`

> I grabbed this from the [FreeBSD Network Performance Tuning Guide](https://calomel.org/freebsd_network_tuning.html), this was their recommended value for if you have 100Gbps network adapters. The default value that came shipped with my OPNsense installation corresponded with the guide’s value for 2Gbps networking. I decided since I may want to expand in the future, I would increase this to this absurd level so I don’t have to deal with this again. You may want to set a more rational value, 16777216 should work for 10Gbps. The guide linked above goes into what this value does and other values it effects in great detail.

# See also

- <https://binaryimpulse.com/2022/11/opnsense-performance-tuning-for-multi-gigabit-internet/>
- <https://forum.opnsense.org/index.php?topic=28833.0>
