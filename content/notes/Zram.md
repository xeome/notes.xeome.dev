---
title: Zram
date updated: 2023-01-21 22:56
---

# Zram Performance Analysis

## Introduction

Zram is a kernel module that utilizes a compressed virtual memory block device allowing for efficient memory management. In this document we will analyze the performance of various compression algorithms used in Zram and their impact on the system. We will also discuss the effects of different page-cluster values on the system's latencies and throughput.

## Compression Algorithm Comparison

The following table compares the performance of different compression algorithms used in Zram, in terms of compression time, data size, compressed size, total size, and compression ratio.

| Algorithm | Cp time | Data | Compressed |  Total | Ratio |
| :-------: | :-----: | :--: | :--------: | :----: | :---: |
|    lzo    |  4.571s | 1.1G |   387.8M   | 409.8M | 2.689 |
|  lzo-rle  |  4.471s | 1.1G |    388M    |  410M  | 2.682 |
|    lz4    |  4.467s | 1.1G |   403.4M   | 426.4M | 2.582 |
|   lz4hc   | 14.584s | 1.1G |   362.8M   | 383.2M | 2.872 |
|    842    | 22.574s | 1.1G |   538.6M   | 570.5M | 1.929 |
|    zstd   |  7.897s | 1.1G |   285.3M   | 298.8M | 3.961 |

As the table shows, the zstd algorithm has the highest compression ratio but is also slower than the other algorithms. However, the compression ratio advantage is more important in this case as it allows more of the working set to fit in uncompressed memory, reducing the need for swap and thus improving performance.

### Page-cluster Values and Latency

The page-cluster value controls the number of pages that are read in from swap in a single attempt, similar to the page cache readahead. The consecutive pages are not based on virtual or physical addresses, but consecutive on swap space, meaning they were swapped out together.

The page-cluster value is a logarithmic value. Setting it to zero means one page, setting it to one means two pages, setting it to two means four pages, etc. A value of zero disables swap readahead completely.

The default value is three (eight pages at a time). However, tuning this value to a different value may provide small benefits if the workload is swap-intensive. Lower values mean lower latencies for initial faults, but at the same time, extra faults and I/O delays for following faults if they would have been part of that consecutive pages readahead would have brought in.

![[notes/assets/img/O_benchmarks_zram_throughput.png]]

![[notes/assets/img/O_benchmarks_zram_latency.png]]

## Conclusion

In the analysis of Zram performance, it was determined that the zstd algorithm provides the highest compression ratio while still maintaining acceptable speeds. The high compression ratio allows more of the working set to fit in uncompressed memory, reducing the need for swap and ultimately improving performance.

For average desktop system, it is recommended to use zstd with `page-cluster=0` as the majority of swapped data is likely stale (old browser tabs). In contrast, systems that require constant swapping may benefit from using the lz4 algorithm due to its higher throughput and lower latency.

It is important to note that the decompression of zstd is slow and results in a lack of throughput gain from readahead. Therefore, `page-cluster=0` should be used for zstd. This is the default setting on [ChromeOS](https://bugs.chromium.org/p/chromium/issues/detail?id=263561#c16=) and seems to be standard practice on [Android](https://cs.android.com/search?q=page-cluster&start=21).

The default `page-cluster` value is set to 3, which is better suited for physical swap. This value dates back to 2005, when the kernel switched to git, and may have been used in a time before the widespread use of SSDs. It is recommended to consider the specific requirements of the system and workload when configuring Zram.

# Sources

<https://linuxreviews.org/Zram>

<https://docs.kernel.org/admin-guide/sysctl/vm.html>

<https://www.reddit.com/r/Fedora/comments/mzun99/new_zram_tuning_benchmarks/>
