---
title: XDP-Tutorial
date updated: 2022-09-25 23:31
---

## Introduction

XDP is an upstream Linux kernel component that allows users to install packet processing programs into the kernel. The programs are written in restricted C and compiled into eBPF byte code. Read the [the academic paper (pdf)](https://github.com/xdp-project/xdp-paper/blob/master/xdp-the-express-data-path.pdf) or the [Cilium BPF reference guide](https://cilium.readthedocs.io/en/latest/bpf/) for a general introduction to XDP.

This tutorial aims to provide a hands-on introduction to the various steps required to create useful programs with the XDP system. We assume you know the basics of Linux networking and how to configure it with the iproute2 suite of tools, but you have no prior experience with eBPF or XDP. All of the lessons are written in C, and they cover basic pointer arithmetic and aliasing. This tutorial is intended to be a hands-on introduction to the various steps required to successfully write useful programs using the XDP system.

## Dependencies

For basic dependencies refer to <https://github.com/xdp-project/xdp-tutorial/blob/master/setup_dependencies.org>.

You will also need xdp-tools. If your distribution repositories lack xdp-tools, you can follow the build instructions from here <https://github.com/xdp-project/xdp-tools> .

## Examples

### Example 1 - Writing a program to pass all packets

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("prog")
int xdp_prog_simple(struct xdp_md *ctx)
{
    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

#### Compiling and loading the example code

The LLVM+clang compiler turns this restricted-C code into BPF-byte-code and stores it in an ELF object file, named `xdp_pass.o`

**Building:**

`clang -O2 -g -Wall -target bpf -c xdp_pass.c -o xdp_pass.o`

**Loading:**

`sudo ip link set interface_name xdpgeneric obj xdp_pass.o sec prog`

Change the interface_name to the name of your interface (for example, `eth0`, `wlan0`).

**Unloading:**

`sudo xdp-loader unload -a interface_name`
As previously described, change the interface name.

### Example 2 - Blocking ICMP packets

```c
#include <stdint.h>
#include <arpa/inet.h>
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/icmp.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
#include <linux/tcp.h>

#define OVER(x, d) (x + 1 > (typeof(x))d)

SEC("prog")
int xdp_prog_simple(struct xdp_md *ctx)
{
    /* data and data_end are pointers to the beginning and end of the packet’s raw
    memory. Note that ctx->data and ctx->data_end are of type __u32, so we have
    to perform the casts */
    void *data_end = (void *)(uintptr_t)ctx->data_end;
    void *data = (void *)(uintptr_t)ctx->data;
    
    struct ethhdr *eth = data;
    struct iphdr *iph = (struct iphdr *)(eth + 1);
    struct icmphdr *icmph = (struct icmphdr *)(iph + 1);

    /* sanity check needed by the eBPF verifier
    When accessing the data in struct ethhdr, we must make sure we don't
    access invalid areas by checking whether data + sizeof(struct ethhdr) >
    data_end, and returning without further action if it's true. This check
    is compulsory by the BPF verifer that verifies your program at runtime. */
    if (OVER(eth, data_end))
        return XDP_DROP;

    if (eth->h_proto != ntohs(ETH_P_IP))
        return XDP_PASS;

    /* sanity check needed by the eBPF verifier */
    if (OVER(iph, data_end))
        return XDP_DROP;

    /* sanity check needed by the eBPF verifier */
    if (OVER(icmph, data_end))
        return XDP_DROP;

    /* 
	struct iphdr {
	#if defined(__LITTLE_ENDIAN_BITFIELD)
		__u8	ihl:4,
			version:4;
	#elif defined (__BIG_ENDIAN_BITFIELD)
		__u8	version:4,
  			ihl:4;
	#else
	#error	"Please fix <asm/byteorder.h>"
	#endif
		__u8	tos;
		__be16	tot_len;
		__be16	id;
		__be16	frag_off;
		__u8	ttl;
		__u8	protocol;
		__sum16	check;
		__be32	saddr;
		__be32	daddr;     
	}; 
	This is the ipheader structure from ip.h; we can see the elements we can access 
    and their types. We can use iph->protocol to determine whether an incoming 
    packet is an ICMP packet or not. */
    if (iph->protocol != IPPROTO_ICMP)
        return XDP_PASS;

    /* drop icmp */
    if (iph->protocol == IPPROTO_ICMP)
        return XDP_DROP;
    
    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

### Example 3 - Recording how many ICMP packets arrived

In this example, we count the number of ICMP packets received from each individual source address and block incoming packets after the first five. So each source address can only send 5 ICMP packets.

![[notes/assets/img/O_BPF_internals.png]]

As shown in the image we can use **eBPF maps** (Map Storage) for storing the amount of packets received. Maps are a general-purpose data structure used to store various types of data. They allow data sharing between eBPF kernel programs as well as between kernel and user-space applications.

Each map type has the following attributes:

```ini
   *  type

   *  maximum number of elements

   *  key size in bytes

   *  value size in bytes
```

Example code:

```c
#include <stdint.h>
#include <arpa/inet.h>
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/icmp.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
#include <linux/tcp.h>

#define OVER(x, d) (x + 1 > (typeof(x))d)

/* Creating a BPF map for counting ICMP packets as described above */
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 65536);
    __type(key, __be32);
    __type(value, long);
} cnt SEC(".maps");

SEC("prog")
int xdp_prog_simple(struct xdp_md *ctx)
{
	/* data and data_end are pointers to the beginning and end of the packet’s raw
    memory. Note that ctx->data and ctx->data_end are of type __u32, so we have
    to perform the casts */
	void *data_end = (void *)(uintptr_t)ctx->data_end;
	void *data = (void *)(uintptr_t)ctx->data;
	
    long *value;
    
    /* Define headers */
	struct ethhdr *eth = data;
	struct iphdr *iph = (struct iphdr *)(eth + 1);
	struct icmphdr *icmph = (struct icmphdr *)(iph + 1);

	/* sanity check needed by the eBPF verifier
    When accessing the data in struct ethhdr, we must make sure we don't
    access invalid areas by checking whether data + sizeof(struct ethhdr) >
    data_end, and returning without further action if it's true. This check
    is compulsory by the BPF verifer that verifies your program at runtime. */

	if (OVER(eth, data_end))
		return XDP_DROP;

	if (eth->h_proto != ntohs(ETH_P_IP))
		return XDP_PASS;

	/* sanity check needed by the eBPF verifier */
	if (OVER(iph, data_end))
		return XDP_DROP;

	/* sanity check needed by the eBPF verifier */
	if (OVER(icmph, data_end))
		return XDP_DROP;

	/* 
	struct iphdr {
	#if defined(__LITTLE_ENDIAN_BITFIELD)
		__u8	ihl:4,
			version:4;
	#elif defined (__BIG_ENDIAN_BITFIELD)
		__u8	version:4,
  			ihl:4;
	#else
	#error	"Please fix <asm/byteorder.h>"
	#endif
		__u8	tos;
		__be16	tot_len;
		__be16	id;
		__be16	frag_off;
		__u8	ttl;
		__u8	protocol;
		__sum16	check;
		__be32	saddr;
		__be32	daddr;     
	}; 
	This is the ipheader structure from ip.h; we can see the elements we can access 
    and their types. We can use iph->protocol to determine whether an incoming 
    packet is an ICMP packet or not. */

	if (iph->protocol != IPPROTO_ICMP)
		return XDP_PASS;

	/* Check protocol of the packet */
    if (iph->protocol == IPPROTO_ICMP) {
        /* Get source address */
        __be32 source = iph->saddr;
        /* Get value pointer address*/
        value = bpf_map_lookup_elem(&cnt, &source);

        if (value) {
            *value += 1;
        } else {
            long temp = 1;
            bpf_map_update_elem(&cnt, &source, &temp, BPF_ANY);
        }

        if (value && *value > 5)
            return XDP_DROP;

        return XDP_PASS;
    }
    
	return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

### Example 4 - Packet modification

In this example, we will set TTL to a pseudorandom number between 1-255.

```c
#include <stdint.h>
#include <arpa/inet.h>
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/icmp.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
#include <linux/tcp.h>

#define OVER(x, d) (x + 1 > (typeof(x))d)

static inline void csum_replace2(uint16_t *sum, uint16_t old, uint16_t new)
{
	uint16_t csum = ~*sum;

	csum += ~old;
	csum += csum < (uint16_t)~old;

	csum += new;
	csum += csum < (uint16_t)new;

	*sum = ~csum;
}

SEC("prog")
int xdp_prog_simple(struct xdp_md *ctx)
{
    /* data and data_end are pointers to the beginning and end of the packet’s raw
    memory. Note that ctx->data and ctx->data_end are of type __u32, so we have
    to perform the casts */
    void *data_end = (void *)(uintptr_t)ctx->data_end;
    void *data = (void *)(uintptr_t)ctx->data;
    uint8_t old_ttl;

    struct ethhdr *eth = data;
    struct iphdr *iph = (struct iphdr *)(eth + 1);
    struct icmphdr *icmph = (struct icmphdr *)(iph + 1);

    /* sanity check needed by the eBPF verifier
    When accessing the data in struct ethhdr, we must make sure we don't
    access invalid areas by checking whether data + sizeof(struct ethhdr) >
    data_end, and returning without further action if it's true. This check
    is compulsory by the BPF verifer that verifies your program at runtime. */
    if (OVER(eth, data_end))
        return XDP_DROP;

    if (eth->h_proto != ntohs(ETH_P_IP))
        return XDP_PASS;

    /* sanity check needed by the eBPF verifier */
    if (OVER(iph, data_end))
        return XDP_DROP;

    /* sanity check needed by the eBPF verifier */
    if (OVER(icmph, data_end))
        return XDP_DROP;

    /* set the TTL to a pseudorandom number 1..255 */
    old_ttl = iph->ttl;
    iph->ttl = bpf_get_prandom_u32() & 0xff ?: 1;

    /* recalculate the checksum, otherwise the IP stack will drop it */
    csum_replace2(&iph->check, htons(old_ttl << 8), htons(iph->ttl << 8));

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
```

### Example 5 - Responding to ICMP echo requests in XDP

In this example, we will respond to ICMP echo requests in XDP. 

```c
#include <arpa/inet.h>
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/icmp.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/ipv6.h>
#include <linux/tcp.h>

#define OVER(x, d) (x + 1 > (typeof(x))d)
#define bpf_memcpy __builtin_memcpy

/**
 * Replaces a 16-bit value in a checksum with a new value.
 *
 * @param sum Pointer to the checksum value to be updated.
 * @param old The old 16-bit value to be replaced.
 * @param new The new 16-bit value to replace the old value.
 */
static inline void csum_replace2(uint16_t* sum, uint16_t old, uint16_t new) {
    uint16_t csum = ~*sum;  // 1's complement of the checksum (flip all the bits)

    csum += ~old;                   // Subtract the old value from the checksum
    csum += csum < (uint16_t)~old;  // If the subtraction overflowed, add 1 to the checksum

    csum += new;                    // Add the new value to the checksum
    csum += csum < (uint16_t) new;  // If the addition overflowed, add 1 to the checksum

    *sum = ~csum;  // 1's complement of the checksum
}

/**
 * Swaps the source and destination MAC addresses in the Ethernet header.
 *
 * @param eth Pointer to the Ethernet header structure.
 */
static inline void swap_src_dst_mac(struct ethhdr* eth) {
    __u8 tmp[ETH_ALEN];
    bpf_memcpy(tmp, eth->h_source, ETH_ALEN);
    bpf_memcpy(eth->h_source, eth->h_dest, ETH_ALEN);
    bpf_memcpy(eth->h_dest, tmp, ETH_ALEN);
}

/**
 * Swaps the source and destination IP addresses in the given IP header.
 *
 * @param ip The IP header to modify.
 */
static inline void swap_src_dst_ip(struct iphdr* ip) {
    __u32 tmp = ip->saddr;
    ip->saddr = ip->daddr;
    ip->daddr = tmp;
}

SEC("prog")
int xdp_responder(struct xdp_md* ctx) {
    // data points to the start of the packet data, and data_end points to the
    // end of the packet data data_end - data is the length of the packet
    void* data_end = (void*)(long)ctx->data_end;
    void* data = (void*)(long)ctx->data;

    struct ethhdr* eth = data;
    struct iphdr* iph = (struct iphdr*)(eth + 1);

    // Sanity checks
    if (OVER(eth, data_end))
        return XDP_DROP;

    if (eth->h_proto != ntohs(ETH_P_IP))
        return XDP_PASS;

    if (OVER(iph, data_end))
        return XDP_DROP;

    // Check if the packet is an ICMP packet
    if (iph->protocol != IPPROTO_ICMP) {
        return XDP_PASS;
    }

    struct icmphdr* icmp = (struct icmphdr*)(iph + 1);
    if (OVER(icmp, data_end))
        return XDP_DROP;

    // Check if the packet is an ICMP echo request
    if (icmp->type != ICMP_ECHO) {
        return XDP_PASS;
    }

    // Swap the source and destination MAC addresses
    swap_src_dst_mac(eth);

    // Swap the source and destination IP addresses
    swap_src_dst_ip(iph);

    // Set the ICMP type to ICMP_ECHOREPLY
    icmp->type = ICMP_ECHOREPLY;

    // Recalculate the ICMP checksum
    csum_replace2(&icmp->checksum, ICMP_ECHO, ICMP_ECHOREPLY);

    // Return XDP_TX to send the packet out
    return XDP_TX;
}

char _license[] SEC("license") = "GPL";
```

## Sources

Many sources have influenced this tutorial, including:

- <https://github.com/xdp-project/xdp-tutorial/>
- <https://developers.redhat.com/blog/2021/04/01/get-started-with-xdp>
- <https://www.tigera.io/learn/guides/ebpf/ebpf-xdp/>
- <https://www.seekret.io/blog/a-gentle-introduction-to-xdp/>
- <https://man7.org/linux/man-pages/man2/bpf.2.html>
- <https://gist.github.com/teknoraver/b66115e3518bb1b7f3e79f52aa2c3424>
