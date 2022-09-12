---
title: JomOS Optimizations
date updated: 2022-09-12 23:46
---

Links: [[notes/Linux]], [[notes/Post Install Optimizations]], [[notes/JomOS Settings]], [[notes/JomOS]]

# JomOS Optimizations

## Optimized repositories

JomOS adds optimized repositories automatically to improve performance and system responsiveness. These repositories also include custom kernels with various CPU schedulers and other goodies.

The optimizations used in the repositories are listed below.

### Compiler optimizations

-march is the first and most important option. This instructs GCC(or other compilers) to generate code for a specific type of CPU. Different CPUs have different capabilities, support different instruction sets, and execute code in different ways. The -march flag instructs the compiler to generate specific code for the selected architecture, including all of its capabilities, features, instruction sets, quirks, and so on.

If the CPU type is unknown, or if the user is unsure which setting to use, the -march=native option can be used. When this flag is set, GCC will attempt to detect the processor and set appropriate flags for it automatically. This should not be used if you want to compile packages for different CPUs!

When compiling packages on one computer to run on another (for example, when using a fast computer to build for an older, slower machine), do not use -march=native. The term "native" indicates that the code produced will only run on that type of CPU. Applications developed with -march=native on an Intel Core CPU will not run on an old Intel Atom CPU.

These are the four x86-64 microarchitecture levels on top of the x86-64 baseline:

- x86-64: CMOV, CMPXCHG8B, FPU, FXSR, MMX, FXSR, SCE, SSE, SSE2
- x86-64-v2: (close to Nehalem) CMPXCHG16B, LAHF-SAHF, POPCNT, SSE3, SSE4.1, SSE4.2, SSSE3
- x86-64-v3: (close to Haswell) AVX, AVX2, BMI1, BMI2, F16C, FMA, LZCNT, MOVBE, XSAVE
- x86-64-v4: AVX512F, AVX512BW, AVX512CD, AVX512DQ, AVX512VL

Most Linux distributions use x86-64-v2 for compatibility with older hardware, but this may limit performance on newer hardware. We detect whether your CPU supports x86-64-v3 and add repositories accordingly. The performance improvement could range from 10% to 35% depending on the processor and software used.

To check if your cpu supports x86-64-v3, you can use the following command:
`/lib/ld-linux-x86-64.so.2 --help | grep "x86-64-v3 (supported, searched)"`

If you get an output saying `x86-64-v3 (supported, searched)` then congratulations, your cpu supports x86-64-v3.

This repository is provided by CachyOS. As theres no reason to create our own v3 repositories. Many thanks to the CachyOS team for creating and maintaining this repository.

## Tuned sysctl values and other configurations

refer to [[notes/JomOS Settings]]
