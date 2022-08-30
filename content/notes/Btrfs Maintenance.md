---
title: Btrfs Maintenance
tags: #linux
toc: true
season: summer
date updated: 2022-08-06 00:04
---

Links: [[Linux]], [[Post install optimizations]]

# Btrfs Maintenance

## Btrfs scrub

Scrubbing reads all data and metadata from devices and verifies checksums. It is not mandatory, but it may detect problems with faulty hardware early because it touches data that may not be in use and causes bit rot.

If there is data/metadata redundancy, such as DUP or RAID1/5/6 profiles, scrub can automatically repair the data if a good copy is available.

You can use `sudo btrfs scrub start /` to start the scan and `sudo btrfs scrub status /` to check the status of it.

## Btrfs balance

The balance command can do a lot of things, but it primarily moves data in large chunks. It is used here to reclaim the space of the underutilized chunks so that it can be allocated again based on current needs.

The goal is to avoid situations in which it is impossible to allocate new metadata chunks, for example, because the entire device space is reserved for all the chunks, even though the total space occupied is smaller and the allocation should succeed.

The balance operation requires enough space to shuffle data around. By workspace, we mean device space with no filesystem chunks on it, not free space as reported by df, for example.

**Expected outcome:** If all underutilized chunks are removed, the total value in the output of `btrfs fi df /path` should be lower than before. Examine the logs.

The balance command may fail due to a lack of space, but this is considered a minor error because the internal filesystem layout may prevent the command from finding enough workspace. This could be a good time to inspect the space manually.

`sudo btrfs balance start --bg /path` to start the balance
`sudo btrfs balance status /path` to check status

## trimming

Although not specifically related to btrfs, this still needs to be mentioned.

The TRIM (aka discard) operation can instruct the underlying device to optimize blocks that are not being used by the filesystem. The fstrim utility performs this task on demand.

This makes sense for SSDs or other types of storage that can translate TRIM actions into useful data (eg. thin-provisioned storage).

You can use `sudo fstrim --fstab --verbose` to run fstrim on all mounted filesystems mentioned in /etc/fstab on devices that support the discard operation.

`--fstab` parameter documentation:
On devices that support the discard operation, trim all mounted filesystems listed in /etc/fstab. If the root filesystem is missing from the file, it is determined from the kernel command line. Other provided options, such as ---offset, --length, and --minimum, are applied to all of these devices. Errors originating from filesystems that do not support the discard operation, as well as read-only devices, autofs, and read-only filesystems, are silently ignored. Filesystems with the mount option "X-fstrim.notrim" are skipped.

`--verbose` parameter documentation:

Verbose execution. With this option fstrim will output the number of bytes passed from the filesystem down the block stack to the device for potential discard. This number is a maximum discard amount from the storage device’s perspective, because FITRIM ioctl called repeated will keep sending the same sectors for discard repeatedly.

## Sources

<https://github.com/kdave/btrfsmaintenance>

<https://man.archlinux.org/man/fstrim.8.en>
