---
title: Emulating Cortex A72
date updated: 2023-08-27 14:29
---

# Introduction

This document provides a step-by-step guide on how to emulate Cortex A72 using a dietpi image. Please note that this is not intended for production. Use at your own risk.

## Prerequisites

- A Linux or macOS (I haven't tried this on MacOS) system
- `wget` to download the dietpi image
- `xz` to decompress the image
- `parted` to resize the image
- `kpartx` to create loop devices
- `nano` or any other text editor of your choice to edit the fstab file

### Create a Project directory

Create a directory to store the project files:

```sh
mkdir rpi_image
cd rpi_image
```

### Download and decompress the Debian RasPi4 image

Download the Debian RasPi4 image and decompress it:

```sh
wget https://dietpi.com/downloads/images/DietPi_RPi-ARMv8-Bookworm.img.xz
xz -d -k DietPi_RPi-ARMv8-Bookworm.img.xz
```

### Mount partitions inside the image

Use kpartx to create loop devices :

```sh
$ sudo kpartx -a -v DietPi_RPi-ARMv8-Bookworm.img
add map loop0p1 (254:0): 0 262144 linear 7:0 2048
add map loop0p2 (254:1): 0 1832960 linear 7:0 264192
```

Mount them like this:

```sh
sudo mkdir /mnt/dietpi
sudo mount /dev/mapper/loop0p2 /mnt/dietpi
sudo mount /dev/mapper/loop0p1 /mnt/dietpi/boot
```

### Copy the kernel and dtb from boot

Copy the kernel to wherever you created your `rpi_image` folder

```sh
cp /mnt/dietpi/boot/kernel8.img ./
cp /mnt/dietpi/boot/bcm2710-rpi-3-b-plus.dtb ./
```

#### Unmount the image

```sh
sudo umount /mnt/dietpi/boot
sudo umount /mnt/dietpi
sudo kpartx -d -v DietPi_RPi-ARMv8-Bookworm.img
```

### Resize the image

You can use parted to resize the second partition, look at the lines starting with `(parted)`

```sh
qemu-img resize DietPi_RPi-ARMv8-Bookworm.img 8G
(parted) print
Model:  (file)
Disk /home/xeome/Downloads/rpi_image/DietPi_RPi-ARMv8-Bookworm.img: 8590MB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start   End    Size   Type     File system  Flags
 1      1049kB  135MB  134MB  primary  fat32        boot, lba
 2      135MB   893MB  758MB  primary  ext4

(parted) resizepart 2 100%
(parted) print
Model:  (file)
Disk /home/xeome/Downloads/rpi_image/DietPi_RPi-ARMv8-Bookworm.img: 8590MB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  135MB   134MB   primary  fat32        boot, lba
 2      135MB   8590MB  8455MB  primary  ext4

(parted) quit
```

### Start qemu

```sh
qemu-system-aarch64 \
    -machine raspi3b \
    -cpu cortex-a72 \
    -dtb ./bcm2710-rpi-3-b-plus.dtb \
    -m 1G \
    -smp 4 \
    -kernel ./kernel8.img \
    -sd ./DietPi_RPi-ARMv8-Bookworm.img \
    -append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 console=tty highres=off console=ttyAMA0 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1 modules-load=dwc2,g_ether" \
    -device usb-net,netdev=eth0 \
    -netdev user,id=eth0,hostfwd=tcp::2222-:22 \
    -device usb-kbd \
    -nographic
```

After the machine boots up, you can ssh into it using the following command:

```sh
ssh root@localhost -p 2222
```

default password is `dietpi`
