---
title: Unevictable LRU Infrastructure
date updated: 2022-08-31 14:05
---

Links: [[notes/Linux]], [[notes/Zram]], [[_index]]

# Unevictable LRU Infrastructure

A non-NUMA x86 64 platform with 128GB of main memory, for example, will have over 32 million 4k pages in a single zone. When a large proportion of these pages are not evictable for any reason (see below), vmscan will spend a significant amount of time scanning the LRU lists in search of the small fraction of evictable pages. This can cause all CPUs to spend 100% of their time in vmscan for hours or days on end, rendering the system completely unresponsive.

The unevictable list addresses the following classes of unevictable pages:

- Those owned by ramfs.
- Those mapped into SHM_LOCK’d shared memory regions.
- Those mapped into VM_LOCKED (mlock()ed) VMAs.

### The Unevictable Page List

The Unevictable LRU infrastructure consists of a per-zone additional LRU list called the "unevictable" list and an associated page flag, PG_unevictable, to indicate that the page is managed on the unevictable list.

The PG_unevictable flag is similar to, but not the same as, the PG_active flag in that it indicates which LRU list a page is on when PG_lru is set.

The Unevictable LRU infrastructure keeps unevictable pages on an additional LRU list for a few reasons:

1. We get to “treat unevictable pages just like we treat other pages in the system - which means we get to use the same code to manipulate them, the same code to isolate them (for migrate, etc.), the same code to keep track of the statistics, etc...” -Rik van Riel
2. We want to be able to migrate unevictable pages between nodes for memory defragmentation, workload management and memory hotplug. The linux kernel can only migrate pages that it can successfully isolate from the LRU lists. If we were to maintain pages elsewhere than on an LRU-like list, where they can be found by isolate_lru_page(), we would prevent their migration, unless we reworked migration code to find the unevictable pages itself.

The unevictable list makes no distinction between files and anonymous, swap-backed pages. This distinction is only relevant while the pages are evictable.

The unevictable list benefits from the “arrayification” of the per-zone LRU lists and statistics originally proposed and posted by Christoph Lameter.

The LRU pagevec mechanism is not used by the unevictable list. Unevictable pages are instead added to the page's zone's unevictable list under the zone lru lock. This allows us to avoid stranding pages on the unevictable list when one task isolates the page from the LRU while other tasks change the "evictability" state of the page.

### Memory Control Group Interaction

By extending the lru list enum, the unevictable LRU facility communicates with the memory control group (aka memory controller; see Documentation/cgroup-v1/memory.txt).

As a result of the "arrayification" of the per-zone LRU lists (one per lru list enum element), the memory controller data structure automatically obtains a per-zone unevictable list. The memory controller monitors page movement to and from the unevictable list.

When memory pressure is applied to a memory control group, the controller will not attempt to reclaim pages from the unevictable list. This has the following effects:

1. Because the pages on the unevictable list are "hidden" from reclaim, the reclaim process can be more efficient, dealing only with pages that have a chance of being reclaimed.

2. However, if too many of the pages charged to the control group are unevictable, the evictable portion of the control group's working set may not fit into the available memory. The control group may thrash or OOM-kill tasks as a result of this.

### Marking Address Spaces Unevictable

For facilities such as ramfs none of the pages attached to the address space may be evicted. The AS_UNEVICTABLE address space flag is provided to prevent eviction of such pages, and it can be manipulated by a filesystem using a number of wrapper functions:

- `void mapping_set_unevictable(struct address_space *mapping);`

  Mark the address space as being completely unevictable.

- `void mapping_clear_unevictable(struct address_space *mapping);`

  Mark the address space as being evictable.

- `int mapping_unevictable(struct address_space *mapping);`

  Query the address space, and return true if it is completely unevictable.

### Detecting Unevictable Pages

In vmscan.c, the function page_evictable() checks the AS_UNEVICTABLE flag to see if a page is evictable or not.

For address spaces that are so marked after being populated (as SHM regions may be), the lock action (eg: SHM_LOCK) can be lazy, and does not need to populate the page tables for the region as mlock() does, nor does it need to make any special effort to push any pages in the SHM LOCK'd area to the unevictable list. Instead, vmscan will do this if and when the pages are encountered during a reclamation scan.

The unlocker (eg: shmctl()) must scan the pages in the region and "rescue" them from the unevictable list if no other condition is keeping them unevictable on an unlock action (such as SHM_UNLOCK). When an unevictable region is destroyed, the pages are "rescued" from the unevictable list as part of the process of freeing them.

page_evictable() also checks for mlocked pages by testing an additional page flag, PG_mlocked (as wrapped by PageMlocked()), which is set when a page is faulted into or found in a VM_LOCKED vma.

### Vmscan's Handling of Unevictable Pages

If unevictable pages are culled in the fault path or moved to the unevictable list during mlock() or mmap(), vmscan will not encounter them until they are evictable again (via munlock(), for example) and "rescued" from the unevictable list. However, there may be times when we decide to leave an unevictable page on one of the regular active/inactive LRU lists for vmscan to deal with. vmscan looks for such pages in all of the shrink_{active|inactive|page}_list() functions and will "cull" any that it finds: that is, it diverts those pages to the zone being scanned's unevictable list.

It is possible that a page is mapped into a VM_LOCKED VMA but is not marked as PG_mlocked. Such pages will be detected when vmscan walks the reverse map in try to unmap() (). If try to unmap() returns SWAP_MLOCK, shrink_page_list() will remove the page.

After dropping the page lock, vmscan uses putback_lru_page(), which is the opposite operation of isolate lru_page(), to put the unevictable page back on the LRU list, effectively "culling" it. putback_lru_page() will recheck the unevictable state of a page that it adds to the unevictable list because the condition that makes the page unevictable may change once the page is unlocked. Putback_lru_page() removes the page from the list and performs additional attempts, including the page_unevictable() test, if the page has ceased to be evictable. These extra evictability checks shouldn't happen in the majority of calls to putback_lru_page() because such a race is an uncommon occurrence and movement of pages onto the unevictable list should be uncommon.

# Sources

<https://www.kernel.org/doc/html/v4.19/vm/unevictable-lru.html>

(This page is paraphrased from kernel documentation attempting to shorten & make it easier to understand)
