---
title: Fedora On Raspberry PI 4
date created: 2023-02-10 23:58
date updated: 2023-02-11 00:56
---

In this guide, we will walk through the steps to set up Fedora Server on your Raspberry Pi 4. This guide assumes that you have some knowledge of using Linux, and have access to the necessary hardware and software components. Note that this guide has been created based on multiple sources and has been modified to reflect the specific requirements for a successful installation on the author's device.

##### Hardware Requirements

- Raspberry Pi 4 Model B
- A microSD card with a capacity of at least 8GB
- A power supply for Raspberry Pi 4
- A microSD card reader

##### Software Requirements

- arm-image-installer
- A terminal emulator
- qemu-user-static
- qemu-user-static-binfmt

### Step 1: Download Fedora Server Image

Download current raw image for aarch64 from <https://getfedora.org/en/server/download/>.

### Step 2: Download UEFI Firmware

Next, download the current UEFI firmware for Raspberry Pi 4 from the following link: <https://github.com/pftf/RPi4/releases>. Unzip the file in a temporary location, such as the Downloads folder.

### Step 3: Preparing The Raw Image

In this step, we will decompress the raw image and prepare it for use.

Decompress the image:

```bash
xz --decompress Fedora-Server-37-1.7.aarch64.raw.xz
```

This will delete the original xz file after decompression and you will be left with `Fedora-Server-37-1.7.aarch64.raw`. You can add `--keep` to keep the compressed version.

Next, list the partitions in the raw image with fdisk:

```bash
$ fdisk -l Fedora-Server-37-1.7.aarch64.raw
Disk Fedora-Server-37-1.7.aarch64.raw: 7 GiB, 7516192768 bytes, 14680064 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x5c5e303a

Device                            Boot   Start      End  Sectors  Size Id Type
Fedora-Server-37-1.7.aarch64.raw1 *       2048  1230847  1228800  600M  6 FAT16
Fedora-Server-37-1.7.aarch64.raw2      1230848  3327999  2097152    1G 83 Linux
Fedora-Server-37-1.7.aarch64.raw3      3328000 14680063 11352064  5,4G 8e Linux LVM
```

The raw image has three partitions: `.raw1` is the bootloader partition, `.raw2` is the Linux boot partition (id 83), and `.raw3` is the partition we want, a Linux LVM partition (id 8e) where Fedora is installed.

To mount the image at the right place, we need to calculate the mount offset as follows:

```bash
sector size (512) x start sector (3328000) = 1703936000
```

However, if we mount the image with this offset, it will fail:

```bash
$ sudo mount -o loop,offset=1703936000 Fedora-Server-37-1.7.aarch64.raw /mnt/raw3

mount: /mnt/raw3: unknown filesystem type 'LVM2_member'.
```

To solve this issue, we need to use a tool like `kpartx`. This utility creates a virtual device in `/dev/mapper` that we can manipulate as a real device. Run the following command to add a device verbosely:

```bash
$ sudo kpartx -a -v Fedora-Server-37-1.7.aarch64.raw
add map loop0p1 (253:0): 0 1228800 linear 7:0 2048
add map loop0p2 (253:1): 0 2097152 linear 7:0 1230848
add map loop0p3 (253:2): 0 11352064 linear 7:0 3328000
```

Then verify the new partitions in `/dev/mapper`:

```bash
$ ls -l /dev/mapper/
total 0
crw------- 1 root root 10, 236 Şub 10 11:28 control
lrwxrwxrwx 1 root root       7 Şub 11 00:17 fedora-root -> ../dm-3
lrwxrwxrwx 1 root root       7 Şub 11 00:17 loop0p1 -> ../dm-0
lrwxrwxrwx 1 root root       7 Şub 11 00:17 loop0p2 -> ../dm-1
lrwxrwxrwx 1 root root       7 Şub 11 00:17 loop0p3 -> ../dm-2
```

Finally, create a directory and mount the LVM partition to the new directory:

```bash
sudo mkdir /mnt/raw3  
sudo mount /dev/fedora/root /mnt/raw3
```

### Step 4:  Working Directly Within The Image

It's time to start making changes to the image. To do this, we'll use `chroot` to change the working root of our session to the root from the image, or alternatively `systemd-nspawn`. To support emulation between architectures, we'll need to install `qemu-user-static`, `qemu-user-static-binfmt` and restart `systemd-binfmt.service`.

Chroot to the mounted disk image and start a shell:

```bash
sudo chroot /mnt/raw3 /bin/bash
```

Ensure that the architecture is `aarch64` and not `x86_64` (use `uname -a`).

Next, we'll create a local user that we'll use to connect via SSH later. The following commands create a group and user named `pi`. The user will have a UID of 1000 and be assigned to the `pi` and `wheel` groups:

```bash
/usr/sbin/groupadd pi  
/usr/sbin/useradd -g pi -G wheel -m -u 1000 pi
```

Create the `.ssh` directory, the `authorized_keys` file, and set proper permissions:

```bash
mkdir /home/pi/.ssh  
chmod 700 /home/pi/.ssh  
touch /home/pi/.ssh/authorized_keys  
chmod 600 /home/pi/.ssh/authorized_keys  
chown -R pi.pi /home/pi/.ssh/
```

Add your public key (`~/.ssh/id_rsa.pub`) to the `authorized_keys` file.

Since our new user belongs to the _wheel_ group, allow this group to use sudo without password:

```bash
echo "%wheel ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/wheel-nopasswd
```

Also, Fedora prompts you to finish the setup on the first boot. To avoid that, disable the initial setup:

```bash
unlink /etc/systemd/system/multi-user.target.wants/initial-setup.service  
unlink /etc/systemd/system/graphical.target.wants/initial-setup.service
```

Change the current directory to the EFI partition. Rename `config.txt` to `config.txt.save`.
And then you can ssh. Congratulations! You successfully connected to your new Fedora Server on your Raspberry Pi!
In the EFI partition, copy the updated firmware files that were downloaded in Step 2. This will replace several files and add a new `config.txt` file:

```bash
cp -r ~/Downloads/rpi4efi/* .
```

In the EFI partition edit config.txt. It should have the following contents:

```ini
arm_64bit=1
enable_uart=1
uart_2ndstage=1
enable_gic=1
armstub=RPI_EFI.fd
disable_commandline_tags=1
disable_overscan=1
device_tree_address=0x1f0000
device_tree_end=0x200000
dtoverlay=miniuart-bt
```

Change the contents to look like the contents below. The two changes are an addition of the kernel line a the top and comment out the armstub line. **Be sure to comment out or delete the start_x=1 line if it exists.** Save and exit the file:

```ini
kernel=rpi4-u-boot.bin
arm_64bit=1
enable_uart=1
uart_2ndstage=1
enable_gic=1
# armstub=RPI_EFI.fd
disable_commandline_tags=1
disable_overscan=1
device_tree_address=0x1f0000
device_tree_end=0x200000
dtoverlay=miniuart-bt
```

That’s all we need to change. Exit the chroot and unmount the disk image:

```bash
exit  
sudo umount /mnt/raw3
```

Deactivate the logical volume inside the volume group **fedora**:

```bash
sudo vgchange --activate n fedora
```

Then delete the virtual device:

```bash
sudo kpartx -d Fedora-Server-37-1.7.aarch64.raw
```

### Step 5: Installing the modified image

Two time-consuming tasks remain: compressing the image and installing it on a microSD card.

Compress the raw disk image to a `.xz` file, but this time keep the `.raw` file:

```
xz --compress Fedora-Server-37-1.7.aarch64.raw --keep
```

I recommend you keep the raw file if you want to make incremental changes in the future. Otherwise, remove the `--keep` parameter.

> This command will take a while.

Finally, copy the modified disk image to a microSD card:

```bash
sudo arm-image-installer --image=Fedora-Server-37-1.7.aarch64.raw.xz --media=/dev/sda --target=rpi4 --addkey=/home/xeome/.ssh/id_rsa.pub --norootpass --relabel --resizefs -y
```

> This command will take some time as well.

### Step 6: Validation

Power on the RPi4. Observe the behavior of the red and green LED lights and the network lights during the boot process, which may take several minutes. The red and green led lights on one end will variously blink, or stay steady, or go out. The network leds will stay steady for several minutes and go out at least twice. At the end, the red and green leds will go out and the network lights will start to blink, indicating that Fedora is now booted and requesting an IP address from your network's DHCP service.

Subsequent boots are much faster.

Find the dynamic IP address assigned to your Raspberry Pi using `nmap` or a similar tool on a Fedora machine or any other computer connected to your home network. Replace the CIDR range as necessary:

```bash
$ sudo nmap -sn 192.168.1.100/25
Nmap scan report for 192.168.1.106
Host is up (0.0048s latency).
MAC Address: E4:5F:01:AA:BB:CC (Raspberry Pi Trading)
```

Connect to your new Fedora Server on the Raspberry Pi using `ssh`. Congratulations! You have successfully connected to your new Fedora Server on your Raspberry Pi!

#### Sources

- <https://medium.com/geekculture/how-to-install-fedora-on-a-headless-raspberry-pi-62adfb7efc5>
- <https://forums.raspberrypi.com/viewtopic.php?t=292630>
