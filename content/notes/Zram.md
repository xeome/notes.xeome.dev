---
title: Zram
date updated: 2022-08-30 20:28
---

Links: [[notes/Linux]], [[notes/Post install optimizations]]

# Zram

### Compression ratio difference

| Algorithm | Cp time | Data | Compressed |  Total | Ratio |
| :-------: | :-----: | :--: | :--------: | :----: | :---: |
|    lzo    |  4.571s | 1.1G |   387.8M   | 409.8M | 2.689 |
|  lzo-rle  |  4.471s | 1.1G |    388M    |  410M  | 2.682 |
|    lz4    |  4.467s | 1.1G |   403.4M   | 426.4M | 2.582 |
|   lz4hc   | 14.584s | 1.1G |   362.8M   | 383.2M | 2.872 |
|    842    | 22.574s | 1.1G |   538.6M   | 570.5M | 1.929 |
|    zstd   |  7.897s | 1.1G |   285.3M   | 298.8M | 3.961 |

### Page-cluster values, latency difference

page-cluster controls the number of pages up to which consecutive pages are read in from swap in a single attempt. This is the swap counterpart to page cache readahead. The mentioned consecutivity is not in terms of virtual/physical addresses, but consecutive on swap space - that means they were swapped out together.

It is a logarithmic value - setting it to zero means “1 page”, setting it to 1 means “2 pages”, setting it to 2 means “4 pages”, etc. Zero disables swap readahead completely.

The default value is three (eight pages at a time). There may be some small benefits in tuning this to a different value if your workload is swap-intensive.

Lower values mean lower latencies for initial faults, but at the same time extra faults and I/O delays for following faults if they would have been part of that consecutive pages readahead would have brought in.

![[notes/assets/img/benchmarks_zram_throughput.png]]

![[notes/assets/img/benchmarks_zram_latency.png]]

## Main takeaways

As you can see zstd has highest compression ratio but is also slower (but still at acceptable speeds). However, compression ratio advantage is more important here because high compression ratio lets more of the working set fit in uncompressed memory, reducing the need for swap and improving performance.

**If you're running desktop systems, I recommend running zstd with page-cluster set to 0, because the majority of the swapped data is most likely stale (old browser tabs). However, if you are running something that requires constant swapping, lz4 may be a better choice due to its higher throughput and lower latency.**

With zstd, the decompression is so slow that that there's essentially zero throughput gain from readahead. Use vm.page-cluster=0 as higher values has a huge latency cost. (This is default on [ChromeOS](https://bugs.chromium.org/p/chromium/issues/detail?id=263561#c16=) and seems to be standard practice on [Android](https://cs.android.com/search?q=page-cluster&start=21).)

The default is `vm.page-cluster=3`, which is better suited for physical swap. Git blame says it was there in 2005 when the kernel switched to git, so it might even come from a time before SSDs.

# Sources

<https://linuxreviews.org/Zram>

<https://docs.kernel.org/admin-guide/sysctl/vm.html>

<https://www.reddit.com/r/Fedora/comments/mzun99/new_zram_tuning_benchmarks/>
