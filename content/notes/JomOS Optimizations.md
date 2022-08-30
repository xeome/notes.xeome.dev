---
title: JomOS Optimizations
tags: #linux
toc: true
season: summer
date updated: 2022-08-12 18:55
---

Links: [[Linux]], [[Post install optimizations]], [[JomOS Settings]], [[JomOS]]

# JomOS Optimizations

## Huge repository with packages compiled with x86_64-v3

These are the four x86-64 microarchitecture levels on top of the x86-64 baseline:

- x86-64: CMOV, CMPXCHG8B, FPU, FXSR, MMX, FXSR, SCE, SSE, SSE2
- x86-64-v2: (close to Nehalem) CMPXCHG16B, LAHF-SAHF, POPCNT, SSE3, SSE4.1, SSE4.2, SSSE3
- x86-64-v3: (close to Haswell) AVX, AVX2, BMI1, BMI2, F16C, FMA, LZCNT, MOVBE, XSAVE
- x86-64-v4: AVX512F, AVX512BW, AVX512CD, AVX512DQ, AVX512VL

For compatibility with older hardware, most Linux distributions use x86-64-v2, but this may limit performance on newer hardware. You're probably running something newer than a Haswell CPU (roughly equalivent to x86-64-v3 baseline), also known as an Intel 4th generation CPU; if so, take advantage of the free performance. Depending on the type of processor and software used, the performance improvement could range from 10% to 35%.

We use CachyOS v3 repositories for this. As theres no reason to create our own v3 repositories.

## Tuned sysctl and other configurations
refer to [[JomOS Settings]]
