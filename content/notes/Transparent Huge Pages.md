---
title: Transparent Huge Pages
date updated: 2022-09-10 23:03
---

Links: [[notes/Linux]], [[notes/Post Install Optimizations]], [[notes/JomOS]]

# Transparent Huge Pages

When the CPU assigns memory to processes that require it, it typically does so in 4 KB page chunks. Because the CPU's MMU unit actively needs to translate virtual memory to physical memory upon incoming I/O requests, going through all 4 KB pages is naturally an expensive operation. Fortunately, it has its own TLB cache (translation lookaside buffer), which reduces the potential amount of time required to access a specific memory address by caching the most recently used memory. The only issue is that TLB cache size is typically very limited, and when it comes to gaming, especially playing triple AAA games, the high memory entropy nature of those applications causes a huge potential bottleneck.

In terms of the overhead that TLB lookups will incur. This is due to the technically inherent inefficiency of having a large number of entries in the page table, all with very small sizes.

To enable automatic use of transparent hugepages, first ensure that they are enabled in your kernel by running `cat /sys/kernel/mm/transparent_hugepage/enabled`. If it says error: the file or directory cannot be found, it means your kernel was built without support for it, and you must either manually build and enable the feature before compiling it or use a different kernel.

There are 3 values you can choose for transparent huge pages:

### always

Should be self explanatory.

### madvise

Only enabled inside MADV_HUGEPAGE regions (to avoid the risk of consuming more memory resources, relevant for embedded systems).

### never

Entirely disabled(mostly for debugging purposes).

Use `echo 'always' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled` to set the value to 'always'.

It may appear that `always` is the best option, but in some cases, such as database software, it degrades performance.
For example mongodb docs says:

> Transparent Huge Pages (THP) is a Linux memory management system that reduces the overhead of Translation Lookaside Buffer (TLB) lookups on machines with large amounts of memory by using larger memory pages.
>
> However, database workloads often perform poorly with THP enabled, because they tend to have sparse rather than contiguous memory access patterns. When running MongoDB on Linux, THP should be disabled for best performance.

So you should experiment with each value to see which one works best for your workload.

# Additional sources

<https://www.kernel.org/doc/html/latest/admin-guide/mm/transhuge.html>

<https://access.redhat.com/solutions/46111>

<https://www.mongodb.com/docs/manual/tutorial/transparent-huge-pages/#:~:text=Transparent%20Huge%20Pages%20(THP)%20is,by%20using%20larger%20memory%20pages.>

<https://www.reddit.com/r/linux_gaming/comments/uhfjyt/underrated_advice_for_improving_gaming/>
