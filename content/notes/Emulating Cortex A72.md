---
title: Emulating Cortex A72
date updated: 2022-09-09 01:12
---

Links: [[notes/Linux]]

# Starting out (Preparing for emulation)

- Create a Project directory.

```sh
$ mkdir rpi_image
$ cd rpi_image
```

- Download and decompress the Debian RasPi4 image.

```sh
$ wget https://raspi.debian.net/tested/20220808_raspi_4_bookworm.img.xz
$ xz --decompress 20220808_raspi_4_bookworm.img.xz
```

- Using `fdisk`, determine the starting sector number.

```sh
$ fdisk -l 20220808_raspi_4_bookworm.img
```

```
Disk 20220808_raspi_4_bookworm.img: 1,95 GiB, 2097152000 bytes, 4096000 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xf7e489e2

Device         Boot  Start     End Sectors  Size Id Type
20220808_raspi_4_bookworm.img1        8192  819199  811008  396M  c W95 FAT32
20220808_raspi_4_bookworm.img2      819200 4095999 3276800  1,6G 83 Linux
```

- Before we mount the image to do some stuff, we need to get an offset in order to correctly mount.<br>Find the `Start` number in the second partition `$something.img2`. It's `819200` in my case. Multiply it by 512, which equals `419430400` in my case.

- Create a mount directory:

```sh
$ mkdir /mnt/raspi4
```

- We can now mount image:

```sh
$ sudo mount -o offset=419430400 20220808_raspi_4_bookworm.img /mnt/raspi4
```

- Now we can extract kernel and initrd from image:<br>(NOTE: We are cd'd into rpi_image directory)

```sh
$ cp /mnt/raspi4/vmlinuz .
$ cp /mnt/raspi4/initrd.img .
```

- Finally, we need to edit `fstab` for slicker(?) mounting via QEMU

```
$ nano /mnt/raspi4/etc/fstab
```

```sh
# The root file system has fs_passno=1 as per fstab(5) for automatic fsck.
LABEL=RASPIROOT / ext4 rw 0 1
# All other file systems have fs_passno=2 as per fstab(5) for automatic fsck.
LABEL=RASPIFIRM /boot/firmware vfat rw 0 2
```

- Replace `LABEL=RASPIROOT` with `/dev/vda2`

- Replace `LABEL=RASPIFIRM` with `/dev/vda1`

- The file should look something like this.

```sh
# The root file system has fs_passno=1 as per fstab(5) for automatic fsck.
/dev/vda2 / ext4 rw 0 1
# All other file systems have fs_passno=2 as per fstab(5) for automatic fsck.
/dev/vda1 /boot/firmware vfat rw 0 2
```

- We can now convert the image to qcow2.

```sh
qemu-img convert -f raw -O qcow2 20220808_raspi_4_bookworm.img rpi.qcow2
```

# Emulation Time!

- We can finally start making our launch script.

```sh
$ nano rpistart.sh
```

**rpistart.sh**

```sh
#!/bin/bash
screen -mS raspberry-pi-4 \
sudo qemu-system-aarch64 \
-M virt \
-m 4096 -smp 4 \
-cpu cortex-a72 \
-kernel vmlinuz \
-initrd initrd.img \
-append "root=/dev/vda2 panic=1 rootfstype=ext4 rw" \
-hda rpi.qcow2 \
-no-reboot \
-nographic
```

- Paste the above into the script and save.

### Some info about script

- Since QEMU doesn't natively support Raspberry Pi 4(b), our only option is to virtualize Cortex A72 (Which is CPU used in Raspberry Pi 4(b)).
- `-nographic` because _who needs graphics._
- `screen` is used 'cuz _why not_.

<br>
* Make script executable

```sh
$ chmod +x rpistart.sh
```

- __And you should_ be able to run QEMU instance._*
- LAUNCH!

```sh
$ ./rpistart.sh
```

# Some wacky reality.

You have booted into nice Debian. Oh, btw, username is passwordless `root`.<br>But there are two problems:

- Not enough space!
- No internet!

## Not enough space!

Very simple. Just:

- poweroff the VM.

```sh
VM$ poweroff
```

- In our `rpi_image` directory, we can resize `qcow2` image via:

```sh
$ qemu-img resize rpi.qcow2 +4G
```

```sh
# Side note: You can also set exact size by getting rid of that + sign.
```

- Now we need to boot into VM once again:

```sh
$ ./rpistart.sh
```

- We have resized the image capacity, but not partition size. We can do that with:

```sh
VM$ resize2fs /dev/vda2
```

- You can check final result via

```sh
VM$ df -H
```

## No internet!

Now we are going to configure our ethernet network interface.

- You can check available network interfaces via:

```sh
VM$ ip addr
```

```
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
```

- Notice, that `enp0s1` has zero IP addresses. We gotta fix that! _By creating another file._

```sh
VM$ nano /etc/network/interfaces.d/enp0s1
```

and paste this in:<br><br>
**enp0s1**

```sh
auto enp0s1

iface enp0s1 inet dhcp
```

- And delete eth0 interface
- Reboot (Although config won't actually let you reboot.)

```sh
VM$ poweroff
```

```sh
$ ./rpistart.sh
```

- You may still receive a networking service error, but you should be able to access the internet.
