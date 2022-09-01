---
title: XDP-Tutorial
date updated: 2022-08-31 14:05
---

Links: [[notes/Linux]] 

# XDP-Tutorial

## Introduction

XDP is an upstream Linux kernel component that allows users to install packet processing programs into the kernel. The programs are written in restricted C and compiled into eBPF byte code. Read the academic paper (pdf) or the Cilium BPF reference guide for a general introduction to XDP.

This tutorial aims to provide a hands-on introduction to the various steps required to create useful programs with the XDP system. We assume you know the basics of Linux networking and how to configure it with the iproute2 suite of tools, but you have no prior experience with eBPF or XDP. All of the lessons are written in C, and they cover basic pointer arithmetic and aliasing. This tutorial is intended to be a hands-on introduction to the various steps required to successfully write useful programs using the XDP system.

Please keep in mind that this tutorial was written by a university first-year computer science student who has only recently begun learning XDP.

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

`sudo xdp-loader load -m skb -s prog interface_name xdp_pass.o`

Change the interface_name to the name of your interface (for example, `eth0`, `wlan0`).

**Unloading:**

`sudo xdp-loader unload -a interface_name`
As previously described, change the interface name.

### Example 2 - Blocking ICMP packets

```C
#include <stdint.h>
#include <arpa/inet.h>
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/icmp.h>

#define SEC(NAME) __attribute__((section(NAME), used))

#define OVER(x, d) (x + 1 > (typeof(x))d)

/* from bpf_helpers.h */
static unsigned long long (*bpf_get_prandom_u32)(void) =
	(void *) BPF_FUNC_get_prandom_u32;

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
	This is the structure of ipheader from ip.h, we can see the elements we can access and their types
	We can use iph->protocol to access the protocol of incoming packet see if its an ICMP packet or not */
    if (iph->protocol != IPPROTO_ICMP)
        return XDP_PASS;

    /* drop icmp */
    if (iph->protocol == IPPROTO_ICMP)
        return XDP_DROP;

    /* set the TTL to a pseudorandom number 1..255 */
    old_ttl = iph->ttl;
    iph->ttl = bpf_get_prandom_u32() & 0xff ?: 1;

    /* recalculate the checksum, otherwise the IP stack wil drop it */
    csum_replace2(&iph->check, htons(old_ttl << 8), htons(iph->ttl << 8));

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";

```

## Sources

Many sources have influenced this tutorial, including:

- <https://github.com/xdp-project/xdp-tutorial/>
- <https://developers.redhat.com/blog/2021/04/01/get-started-with-xdp>
