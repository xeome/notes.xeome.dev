---
title: Linux Memory Management
date updated: 2022-09-25 23:30
---

## Memory Management Concepts

### Virtual Memory

Virtual memory abstracts the details of physical memory from the userspace software. It allows only the information needed to be held in physical memory (paging on demand) and provides a mechanism for the protected and controlled sharing of data between processes. When the CPU executes a process that reads (or writes) from (or to) system memory, it translates the virtual address encoded in that instruction into a physical address.

Linux groups data in memory into pages, typically 4KiB in size. Address translation requires several memory accesses and memory accesses are slow. To avoid wasting valuable CPU cycles on address translation, CPUs keep a cache of such translations called Translation Lookaside Buffer (or TLB). Typically, the TLB is a very limited resource and applications with large memory working sets will suffer performance loss because they cannot utilize the TLB.

### Transparent Huge Pages

When the CPU assigns memory to processes that require memory, it usually does so in chunks of 4 KB pages. Since the CPU's MMU unit must actively translate virtual memory into physical memory upon incoming I/O requests, it is inherently expensive to review all 4 KB pages. Fortunately, it has its own TLB cache (translation lookaside buffer), which reduces the potential time required to access a given memory address by caching the most recently used memory. The fact that the TLB cache size is usually very limited can cause a large potential bottleneck for applications with high memory entropy.

Many modern CPU architectures support direct memory page mapping via higher levels in the page table. On x86, for example, entries in the second and third level page tables can be used to map 2M and even 1G pages. In Linux, such pages are referred to as huge. The use of huge pages relieves TLB pressure, improves TLB hit-rate, and thus improves overall system performance.

### LRU list

A pair of least recently used (LRU) lists are used by the Linux kernel to track pages. Pages that have been recently accessed are kept in the "active" list, and newly accessed pages are at the top of the list. If a page has not been accessed recently, it is removed from the list's queue and moved to the top of the "inactive" list. When a process accesses a page in the inactive list, it is returned to the active list.

### Unevictable LRU Infrastructure

An x86 64 platform with 128 GB main memory, for example, will have more than 32 million 4k pages in a single region. If the majority of these pages are unevictable, vmscan will scan the LRU lists for evictable parts, which will consume a significant amount of CPU. The system's performance will deteriorate.

The unevictable list addresses the following classes of unevictable pages:

- Those owned by ramfs.
- Those in the SHM_LOCK shared memory zones of ramfs
- VMAs marked as VM_LOCKED (mlock()ed) (virtual memory area)

For each zone, the Unevictable LRU engine generates a separate list of LRUs. The unevictable list is referred to as such, and the PG_unevictable flag is used to indicate that pages are unevictable.

The Unevictable LRU infrastructure maintains unevictable pages on an additional LRU list for a few reasons:

1. We get to “treat unevictable pages just like we treat other pages in the system - which means we get to use the same code to manipulate them, the same code to isolate them (for migrate, etc.), the same code to keep track of the statistics, etc...” - Rik van Riel
2. We want to be able to migrate unevictable pages between nodes for memory defragmentation, workload management and memory hotplug. The linux kernel can only migrate pages that it can successfully isolate from the LRU lists. If we were to maintain pages elsewhere than on an LRU-like list, where they can be found by isolate_lru_page(), we would prevent their migration, unless we reworked migration code to find the unevictable pages itself.

The unevictable list does not differentiate between files and anonymous, swap pages. This distinction only applies when pages are evictable.

# What is MGLRU

The Linux kernel has developed mechanisms designed to increase the chances of predicting which memory pages will be accessed in the near future. Yu Zhao's MGLRU (multi generational least recently used) patch set is an attempt to improve the situation. It aims to make it easier for the system to discard unused data pages in order to make room in memory for new data.

A pair of least recently used (LRU) lists are used by the kernel to track pages. Pages that have been recently accessed are kept in the "active" list, and newly accessed pages are at the top of the list. Some pages end up in the inactive list, which means they will be reclaimed relatively quickly once they are no longer required. For various reasons, the kernel has a long history of dumping file-backed pages. This issue is especially effective on cloud systems.

The MGLRU patches attempt to address these issues with two key changes:

- Add more LRU lists to cover the range of page ages between the current active and inactive lists; these lists are called "generations".
- Reduce overhead by changing the way pages are scanned (the old system uses a complex reverse mapping algorithm)

Only the oldest generation should be considered when reclaiming pages. The "oldest generation" may differ for anonymous and file-backed pages; anonymous pages may be more difficult to reclaim in general (they must always be written to swap), and the new code retains some of the bias toward aggressively reclaiming file-backed pages. As a result, file-backed pages may not survive reclaim for as many generations as anonymous pages. However, the current patch only allows reclaiming of file-backed pages to get one generation ahead of anonymous pages.

# Sources

- <https://lwn.net/Articles/851184/>
- <https://www.kernel.org/doc/html/v5.0/vm/unevictable-lru.html>
- <https://docs.kernel.org/admin-guide/mm/concepts.html#mm-concepts>
