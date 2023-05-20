---
title: Intel's Exploration of a 64-Bit Mode-Only Architecture, A Path to Simplicity
date created: 2023-05-20 17:43
date updated: 2023-05-20 18:05
---

## Introduction

The Intel® Architecture has withstood the test of time, establishing a robust software ecosystem spanning a wide range of devices, from PCs to supercomputers. With the prevalence of 64-bit operating systems and the dominance of the Intel® 64 architecture, Intel is now exploring x86S (for simplification), a 64-bit mode-only architecture. This blog post discusses the deprecation of legacy modes, the proposed enhancements, and the potential benefits of this architectural transition.

## Deprecation of Legacy Modes

As technology advances, certain legacy modes within the Intel® 64 architecture have become obsolete and offer little utility in modern operating systems. Intel firmware no longer supports non-UEFI64 operating systems natively, and Microsoft has ceased shipping the 32-bit version of Windows 11. While 64-bit operating systems still retain the ability to run 32-bit applications, they no longer support 16-bit applications natively. Thus, it becomes pertinent to question whether these seldom-used elements of the architecture can be removed to simplify a 64-bit mode-only architecture.

## Enhancements in a 64-Bit Mode-Only Architecture

A transition to a 64-bit mode-only architecture entails replacing legacy modes with their 64-bit counterparts and streamlining the system architecture. Some of the proposed enhancements include:

1. Booting CPUs: Currently, CPUs start in real-address mode and require multiple stages of code transitions to enter 64-bit mode. A direct 64-bit reset state eliminates the need for these trampoline code stages, simplifying the bootstrapping process.

![[notes/assets/img/bootstrapping.png]]

2. Paging: The proposed architecture allows for seamless switching to 5-level paging without leaving a paged mode. This eliminates the need to disable paging, as required in the current architecture.

3. Reduced Complexity: The removal of deprecated features reduces the overall complexity of the software and hardware architecture, making it easier to develop and maintain.

4. Alignment with Modern Software: The simplified segmentation model of 64-bit architecture can be used to support segmentation in 32-bit applications, aligning with the practices of modern operating systems.

5. Elimination of Unused Features: Removing unused features like ring 1 and 2, obsolete segmentation elements, 16-bit addressing support, and certain I/O port accesses streamlines the architecture and improves efficiency.

## What does this all mean/personal sumary

Intel's exploration of a 64-bit mode-only architecture represents a significant step towards simplification and efficiency in the Intel® Architecture. By deprecating legacy modes that serve little purpose in modern operating systems, Intel aims to streamline the software and hardware ecosystem. This proposed transition offers benefits such as reduced complexity, improved alignment with modern software practices, and the removal of unused features. While running legacy operating systems directly on a 64-bit mode-only architecture is not the primary objective, virtualization-based solutions can emulate the necessary features. As Intel seeks feedback from the ecosystem, this architectural shift has the potential to shape the future of Intel-based computing platforms, paving the way for optimized performance and enhanced user experiences.

# See Also

- <https://www.intel.com/content/www/us/en/developer/articles/technical/envisioning-future-simplified-architecture.html>
- <https://www.javatpoint.com/what-is-x86>
