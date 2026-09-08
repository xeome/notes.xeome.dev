---
title: Btrfs Maintenance
date updated: 2023-02-11 01:15
---

## Btrfs Scrub

The Btrfs scrub operation reads all data and metadata from devices and verifies their checksums. This can help to detect problems with faulty hardware early, as it touches data that may not be in use and may be vulnerable to bit rot. If there is data/metadata redundancy in the file system, such as DUP or RAID1/5/6 profiles, scrub can automatically repair the data if a good copy is available.

To start a scrub operation, use the following command:

```bash
sudo btrfs scrub start /
```

To check the status of a scrub operation, use the following command:

```bash
sudo btrfs scrub status /
```

## Btrfs balance

The balance command can do a lot of things, but it primarily moves data in large chunks. It is used here to reclaim the space of the underutilized chunks so that it can be allocated again based on current needs.

The goal is to avoid situations in which it is impossible to allocate new metadata chunks, for example, because the entire device space is reserved for all the chunks, even though the total space occupied is smaller and the allocation should succeed.

The balance operation requires enough space to shuffle data around. By workspace, we mean device space with no filesystem chunks on it, not free space as reported by df, for example.

The balance command may fail due to a lack of space, but this is considered a minor error because the internal filesystem layout may prevent the command from finding enough workspace. This could be a good time to inspect the space manually.

Running `btrfs balance start` without any filters, would re-write every Data and Metadata chunk on the disk. Usually, this is not what we want. Instead use the `usage` filter to limit what blocks should be balanced.

Using `-dusage=5` we can limit balance to compact data blocks that are less than 5% full. This is a good start, and we can increase it to 10-15% or more if needed. A small (less than 100GiB) filesystem may need a higher number.

Similarly using `-musage=5` we can limit balance to compact metadata chunks.

### Examples

To start balance on data chunks:

`sudo btrfs balance start --bg -dusage=5 /path`

To start balance on metadata chunks:

`sudo btrfs balance start --bg -musage=5 /path`

to check status of balance operation:

`sudo btrfs balance status /path`

**Expected outcome:** If all underutilized chunks are removed, the total value in the output of `btrfs fi df /path` should be lower than before. Examine the logs.

## Manual deduplication using duperemove

> Duperemove is a simple tool for finding duplicated extents and submitting them for deduplication. When given a list of files it will hash their contents on a block by block basis and compare those hashes to each other, finding and categorizing blocks that match each other. When given the -d option, duperemove will submit those extents for deduplication using the Linux kernel extent-same ioctl.
> Duperemove can store the hashes it computes in a 'hashfile'. If given an existing hashfile, duperemove will only compute hashes for those files which have changed since the last run. Thus you can run duperemove repeatedly on your data as it changes, without having to re-checksum unchanged data.

As the above explanation from project's github readme states, you can use this tool for checking and reporting duplicate extents to kernel.

I saved an estimate of around 17G on 180GiB of mixed data, photos, videos, games, documents etc.
![[notes/assets/img/O_Pasted image 20230119010141.png]]
Here is how I use this tool:

```bash
sudo duperemove --hashfile=/home/$USERNAME/.hashfile -dhr /
```

Parameter explanations:

- `--hashfile=location` can be used to specify location of hashfile to be reused later.

> Hashfiles are essentially sqlite3 database files with 3 tables, `config`, `files` and `hashes`. Hashfiles are meant to be reused - duperemove will store the results of the scan and dedupe stages to speed up subsequent runs.

- `-d` De-dupe the results - only works on btrfs and xfs.
- `-h` Print numbers in human-readable format.
- `-r` Enable recursive dir traversal.

and lastly `/` which is the location we want to dedupe.

Notice: The hash file format in Duperemove master branch is under development and may change. If the changes are not backwards compatible, you will have to re-create your hash file.

## Trimming

Although trimming is not exclusive to btrfs, I felt like still needs to be mentioned.

The TRIM (aka discard) operation can instruct the underlying device to optimize blocks that are not being used by the filesystem. The fstrim utility performs this task on demand.

This makes sense for SSDs or other types of storage that can translate TRIM actions into useful data (eg. thin-provisioned storage).

You can use `sudo fstrim --fstab --verbose` to run fstrim on all mounted filesystems mentioned in /etc/fstab on devices that support the discard operation.

`--fstab`:

On devices that support the discard operation, trim all mounted filesystems listed in /etc/fstab. If the root filesystem is missing from the file, it is determined from the kernel command line. Other provided options, such as `--offset`, `--length`, and `--minimum`, are applied to all of these devices. Errors originating from filesystems that do not support the discard operation, as well as read-only devices, autofs, and read-only filesystems, are silently ignored. Filesystems with the mount option `X-fstrim.notrim` are skipped.

`--verbose`:

Verbose execution. With this option fstrim will output the number of bytes passed from the filesystem down the block stack to the device for potential discard. This number is a maximum discard amount from the storage device’s perspective, because FITRIM ioctl called repeated will keep sending the same sectors for discard repeatedly.

You can read more about trim here [[notes/Trim]].

## Sources

<https://github.com/kdave/btrfsmaintenance>

<https://github.com/markfasheh/duperemove#duperemove>

<https://github.com/markfasheh/duperemove/wiki/Duperemove-Design#hashfiles>

<https://man.archlinux.org/man/fstrim.8.en>
