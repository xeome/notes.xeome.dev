---
title: Optimization Techniques
date created: 2023-01-26 02:33
date updated: 2023-01-26 03:41
---

# WARNING: WORK IN PROGRESS

# Introduction

In this document, I will try to explain various optimization techniques that can be applied to software development to improve its performance, power efficiency, and security. These techniques include Profile-Guided Optimization (PGO), Link-Time Optimization (LTO), LLVM BOLT, Compiler Flags, and other optimization techniques such as dead code elimination, constant propagation, register allocation, loop unrolling, inlining, instruction scheduling and vectorization, and interprocedural optimization (IPO). I will explain the concepts, working mechanism, benefits, and limitations of each optimization technique, along with examples of how they can be applied in practice. By the end of this document, I hope that the readers will have a comprehensive understanding of the different optimization techniques available and be able to choose the appropriate optimization technique for their specific use case.

# Link-Time Optimization (LTO)

## Definition and concept

## How LTO works

# LLVM BOLT

## Definition and concept

LLVM BOLT (Binary Optimization and Analysis Tool) is a tool for optimizing and analyzing binary code. It is built on top of the LLVM compiler infrastructure, and it works by analyzing the control flow graph (CFG) of the binary code and applying a variety of optimization techniques to improve performance.

## How BOLT works

BOLT runs passes with either code transformations or analyses, similar to a compiler. BOLT is also equipped with a data-flow analysis framework to feed information to passes that need it. Some passes are architecture-independent while others are not. In this section, we discuss the passes applied to the Intel x86-64 target.

| Pass Name             | Description                                                                                                       |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------- |
| 1. strip-rep-ret      | Strip repz from repz retq instructions used for legacy AMD processors                                             |
| 2. icf                | Identical code folding                                                                                            |
| 3. icp                | Indirect call promotion                                                                                           |
| 4. peepholes          | Simple peephole optimizations                                                                                     |
| 5. simplify-ro-loads  | Fetch constant data in .rodata whose address is known   statically and mutate a load into a mov                   |
| 6. icf                | Identical code folding (second run)                                                                               |
| 7. plt                | Remove indirection from PLT calls                                                                                 |
| 8. reorder-bbs        | Reorder basic blocks and split hot/cold blocks into separate sections (layout optimization)                       |
| 9. peepholes          | Simple peephole optimizations (second run)                                                                        |
| 10. uce               | Eliminate unreachable basic blocks                                                                                |
| 11. fixup-branches    | Fix basic block terminator instructions to match the CFG and the current layout (redone by reorder-bbs)           |
| 12. reorder-functions | Apply HFSort to reorder functions (layout optimization)                                                           |
| 13. sctc              | Simplify conditional tail calls                                                                                   |
| 14. frame-opts        | Removes unnecessary caller-saved register spilling                                                                |
| 15. shrink-wrapping   | Moves callee-saved register spills closer to where they are needed, if profiling data shows it is better to do so |

Some parts of bellow information is rewritten and some are directly taken from the paper.

strip-rep-ret:

> In favor of I-cache space, such as removing alignment NOPs and AMD-friendly REPZ bytes, or using shorter versions of instructions. Our findings show that, for large applications, it is better to aggressively reduce I-cache occupation, except if the change incurs D-cache overhead since the cache is one of the most constrained resources in the data-center space. This explains BOLT’s policy of discarding all NOPs after reading the input binary. Even though compiler-generated alignment NOPs are generally useful, the extra space required by them does not pay off and simply stripping them from the binary provides a small but measurable performance improvement.

icf:

> BOLT features identical code folding (ICF) to complement the ICF optimization done by the linker. An additional benefit of doing ICF at the binary level is the ability to optimize functions that were compiled without the -ffunction-sections flag and functions that contain jump tables. As a result, BOLT is able to fold more identical functions than the linkers. We have measured the reduction of code size for the HHVM binary [19] to be about 3% on top of the linker’s ICF pass.

icp and plt:

Passes 3 and 7 leverage call frequency information to optimize function calls. Pass 3, indirect call promotion, mutates a function call into a more performant version, while pass 7, PLT call optimization, removes indirection from PLT calls. BOLT also has the ability to do function inlining, but it is a limited version compared to what compilers perform at higher levels. The inlining opportunities that BOLT can take advantage of typically come from more accurate profile data, BOLT’s own indirect-call promotion optimization, cross-module nature, or a combination of these factors.

simplify-ro-loads:

> Simplification of load instructions, explores a tricky tradeoff by fetching data from statically known values (in read-only sections). In these cases, BOLT may convert loads into immediate-loading instructions, relieving pressure from the D-cache but possibly increasing pressure on the I-cache, since the data is now encoded in the instruction stream. BOLT’s policy, in this case, is to abort the promotion if the new instruction encoding is larger than the original load instruction, even if it means avoiding an arguably more computationally expensive load instruction. However, we found that such opportunities are not very frequent in our workloads.

reorder-bbs:

> Pass 8, reorder and split hot/cold basic blocks, reorders basic blocks according to the most frequently executed paths, so the hottest successor will most likely be a fall-though, reducing taken branches and relieving pressure from the branch predic- tor unit

# Profile-Guided Optimization (PGO)

I recommend checking out the following document written by my friend which can be found at <https://misile00.github.io/notes/PGO>. This document provides a detailed explanation of PGO and how it can be applied in practice.

# Compiler Flags

## Overview of compiler flags

## Commonly used flags for optimization

# LLVM POLLY

## Definition and concept

## How POLLY works

# Other Optimization Techniques

## Dead Code Elimination

## Constant Propagation

## Register Allocation

## Loop Unrolling

## Inlining

## Instruction Scheduling

## Vectorization

## Interprocedural Optimization (IPO)
