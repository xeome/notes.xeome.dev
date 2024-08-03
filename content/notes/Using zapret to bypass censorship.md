# Bypassing Censorship Using Zapret: A Technical Guide

Censorship has become a significant challenge in today's digital age, affecting internet freedom worldwide. Various tools and techniques have been developed to counteract these restrictions, allowing users to access blocked content. One such tool is Zapret, a stand-alone DPI circumvention tool designed primarily for the Russian audience to combat censorship imposed by Roskomnadzor. However, its utility extends beyond Russia, offering a solution for bypassing HTTP(S) website blocking and resisting signature TCP/UDP protocol discovery globally.

Make sure to check for the legality of using such tools in your country before proceeding. This guide provides a technical overview of how to use Zapret to bypass censorship effectively. *For educational purposes only.*

Also check for DNS poisoning first, it will be a lot easier to bypass than DPI and it prevents blockcheck.sh from working properly.

## How to Use Zapret

First cloned the repository from GitHub:

```bash
git clone https://github.com/bol-van/zapret.git
```

Then, navigate to the cloned directory and run the following command to install the required binaries:

```bash
./install_bin.sh
```

After successfully installing the binaries, the next step is to determine the most effective parameters for bypassing DPI (Deep Packet Inspection). To do this, run the blockcheck.sh script as root. This script analyzes your network environment and identifies the best parameters for circumventing DPI:

```bash
sudo ./blockcheck.sh
```

It will ask you to enter the URL of a blocked website. After entering the URL, the script will output a summary with the recommended parameters for bypassing DPI.

Example output:

![[Pasted image 20240803182850.png]]

Next, run install_easy.sh and follow the on-screen instructions, adjust the parameters as recommended by blockcheck.sh:

```bash
sudo ./install_easy.sh
```

Edit the configuration file to include the recommended parameters:

![[Pasted image 20240803183317.png]]

empty out NFQWS_OPT_DESYNC= and put the recommended parameters from blockcheck.sh, in this case, it is:

```bash
NFQWS_OPT_DESYNC="--dpi-desync=fake --dpi-desync-ttl=4"
```

for NFQWS_OPT_DESYNC_QUIC use if any parameters were recommended by blockcheck.sh. In our case it works without bypass needed.

You may need to change some settings while running the script, such as the keepalive setting etc. The script will guide you through the process. Try and test different settings to find the most effective configuration for your network environment.

The install_easy.sh script will do the rest of the work for you, including setting up the iptables rules and starting the zapret service.
