---
title: Why do SSDs need trim
date updated: 2022-09-25 23:31
---

## How does SSD store data

Let's look at the structure of the SSD to understand the problems it faces and why we need TRIM operation to solve them. Data is typically stored in pages, which are groups of 4KB cells. For most SSDs, the pages are then grouped into clusters of 128 pages called Blocks, with each block containing 512KB.

You can read data from a page that contains some information or write data to clean pages (with no data from before in them). However, you cannot overwrite data on a previously written 4KB page without also overwriting the remaining 512KB.

This is because the voltages required to flip a 0 to 1 are frequently much higher than the reverse. Excess voltage has the potential to flip bits on adjacent cells and corrupt data.

## File deletion

When you delete a file the SSD simply marks all corresponding pages as invalid. Instead of being physically zeroed out, the sectors are marked as free. This significantly speeds up the deletion process.

Assume you change a file, which corresponds to a single 4KB page change. When you try to modify a 4KB page in an SSD, the entire content of its block, all 512KB of it, must be read into a cache (which can be built into the SSD or use system's main memory), the block must be erased, and then you can write the new data to your target 4KB page. You will also need to restore the remaining unmodified 508KB of data from your cache.

## So what does TRIM do?

TRIM informs the drive that the blocks are no longer in use. That is, they can be deleted and used again for new data.

An SSD does not understand the file system that has been written to it. As a result, it has no idea how NTFS (For example) deletes files. Now TRIM comes into play. After a file is deleted, the operating system sends a TRIM command to the SSD, along with a list of sectors that should be marked free and erased.

The TRIM command reduces performance degradation by trimming invalid pages on a regular basis. Windows 10 for example TRIMs your SSD once a week. When that operation is run, the SSD controller cleans out all the data that has been marked as deleted by the OS from the memory cells. Yes, it still has to go through the read-modify-write operation, but it only happens once a week, so if all pages in a block are marked for deletion by the time trimming occurs, there will be no pages to copy to the cache therefore reducing writes and improving device lifespan.

When you want to write to a page again, it will be empty and ready for a direct write operation!
