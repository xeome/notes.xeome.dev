---
title: Post install Optimizations
date updated: 2022-09-09 01:13
---

Links: [[notes/Linux]], [[notes/Btrfs Maintenance]], [[notes/JomOS Settings]], [[notes/Zram]]

# Post Install Optimizations

### Editing mkinitcpio.conf for faster boot times

Replace udev with systemd for faster boots and set compression algorithm to zstd and compression level to 2 because compression ratio increase isn't worth the increased boot time.

(bellow isnt the whole file, just the parts that needs changes)

```ini
HOOKS="base systemd autodetect...

COMPRESSION="zstd"
COMPRESSION_OPTIONS=(-2)
```

Note: You can replace base AND udev with systemd but you will lose access to recovery shell.

### Changing io schedulers

The process to change I/O scheduler, depending on whether the disk is rotating or not can be automated and persist across reboots. For example the udev rule below sets the scheduler to none for NVMe, mq-deadline for SSD/eMMC, and bfq for rotational drives:

```ini
# /etc/udev/rules.d/60-ioschedulers.rules

# set scheduler for NVMe
ACTION=="add|change", KERNEL=="nvme[0-9]n[0-9]", ATTR{queue/scheduler}="none"
# set scheduler for SSD and eMMC
ACTION=="add|change", KERNEL=="sd[a-z]*|mmcblk[0-9]*", ATTR{queue/rotational}=="0", ATTR{queue/scheduler}="mq-deadline"
# set scheduler for rotating disks
ACTION=="add|change", KERNEL=="sd[a-z]*", ATTR{queue/rotational}=="1", ATTR{queue/scheduler}="bfq"
```

### Editing /etc/makepkg.conf (in Arch linux or derivatives)

Edit makepkg config file for it to utilize all threads on your cpu
Example for 12 threads:

```ini
MAKEFLAGS="-j12"
```

### Auto nice daemons and irq balance

Ananicy-cpp can be installed to automatically set [nice](https://en.wikipedia.org/wiki/Nice_(Unix)) levels.

[Irq balance](https://wiki.archlinux.org/title/Improving_performance#irqbalance) distributes [hardware interrupts](https://en.wikipedia.org/wiki/Interrupt_request_(PC_architecture)) across available processors to improve system performance.

### Zram or Zswap

Zswap is a kernel feature that provides a compressed RAM cache for swap pages. Pages which would otherwise be swapped out to disk are instead compressed and stored into a memory pool in RAM. Once the pool is full or the RAM is exhausted, the least recently used (LRU) page is decompressed and written to disk, as if it had not been intercepted. After the page has been decompressed into the swap cache, the compressed version in the pool can be freed.

The difference compared to ZRAM is that zswap works in conjunction with a swap device while zram is a swap device in RAM that does not require a backing swap device.

Since it is enabled by default, [disable zswap](https://wiki.archlinux.org/title/Zswap#Toggling_zswap "Zswap") when you use zram to avoid it acting as a swap cache in front of zram. Having both enabled also results in incorrect [zramctl](https://man.archlinux.org/man/zramctl.8) statistics as zram remains mostly unused; this is because zswap intercepts and compresses memory pages being swapped out before they can reach zram.

##### Recommended configurations for zswap

```C
# echo zstd > /sys/module/zswap/parameters/compressor

# echo 10 > /sys/module/zswap/parameters/max_pool_percent
```

Above will change zswap settings only for current session, to make the setting changes persist add `zswap.compressor=zstd zswap.max_pool_percent=10` to your bootloader's config file for the kernel command line.

`/etc/sysctl.d/99-swap-tune.conf:`
for ssd:

```ini
vm.page-cluster = 1 
```

for hdd:

```ini
vm.page-cluster = 2
```

##### Recommended configurations for zram

`/etc/systemd/zram-generator.conf:`

```ini
[zram0]
zram-size = ram * 1
compression-algorithm = zstd
```

Above config file is for [systemd zram generator](https://github.com/systemd/zram-generator)

You can increase `zram-size` further if you find compression ratio to be high enough.

`/etc/sysctl.d/99-swap-tune.conf:`

```ini
vm.page-cluster = 0
```

A more detailed explanation can about why these values were chosen can be found in [[notes/Zram]].

### Transparent Huge Pages

To summarize, transparent hugepages are a framework within the Linux kernel that allows it to automatically facilitate and allocate large memory page block sizes to processes (such as games) with sizes averaging around 2 MB per page and occasionally 1 GB (the kernel will automatically adjust the size to what the process needs).

```bash
[user@host ~]$ cat /sys/kernel/mm/transparent_hugepage/enabled
[always] madvise never
```

There are 3 values you can choose You should try each value yourself to see if it improves your workflow, for more information click here: [[notes/Transparent Huge Pages]].
To change the value for current session:

```bash
echo 'always' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

To make changes persist:\
Install sysfsutils and then add `kernel/mm/transparent hugepage/enabled=always` to `/etc/sysfs.conf` or add `transparent_hugepage=always` to your bootloader's config file for the kernel command line.

# Additional sources

#### initramfs

<https://wiki.archlinux.org/title/Mkinitcpio/Minimal_initramfs>

#### Zram

<https://linuxreviews.org/Zram>

<https://docs.kernel.org/admin-guide/sysctl/vm.html>

<https://www.reddit.com/r/Fedora/comments/mzun99/new_zram_tuning_benchmarks/>

#### Transparent Huge Pages

<https://www.kernel.org/doc/html/latest/admin-guide/mm/transhuge.html>

<https://access.redhat.com/solutions/46111>

<https://www.reddit.com/r/linux_gaming/comments/uhfjyt/underrated_advice_for_improving_gaming/>
