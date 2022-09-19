---
title: Thorium
date updated: 2022-09-19 14:41
---

Links: [[notes/VS Code server]]

# Thorium

Chromium fork for linux named after [radioactive element No. 90](https://en.wikipedia.org/wiki/Thorium) that takes pride in being a highly optimized web browser.

Thorium makes many modifications to compiler configurations which highly improve performance and responsiveness. Google tries to minimize size at any cost (including RAM usage and performance), but Thorium takes a different approach. Thorium takes up approximately ~250MB compared to ~150MB for Chrome. Me and many others appreciate speed and performance over the smallest size.

## Compiler Optimizations

Thorium enables the use of numerous instruction set extensions, allowing the CPU to perform certain operations much more efficiently and quickly. For example the Chromium Project, makes extensive use of vectorizable code, so AVX (Advanced Vector Extensions) is a natural next step in performance improvement. The only reason it isn't used by default in Chromium is for compatibility: older processors (pre-2011) lack AVX capability and thus cannot run AVX-compliant programs. But don't worry if you have an old processor that lacks AVX; the creator occasionally makes SSE4/SSE3-only releases for Linux and Windows.

This represents only the tip of the iceberg. If you're interested in learning more about Thorium's performance optimizations, click [here](https://thorium.rocks/optimizations).

## Some Benchmarks

Depending on your operating system and hardware, performance improvements may vary. Here are some results from tests on an old CPU, an FX-8370 clocked at 4.7GHz across all cores.

### Chromium

![[notes/assets/img/chromium_octane.png]]
![[notes/assets/img/chromium_speedometer.png]]

### Thorium

![[notes/assets/img/thorium_octane.png]]
![[notes/assets/img/thorium_speedometer.png]]

As you can see, there are significant performance improvements, but they may not be as dramatic on your device. For example, on my Ryzen 5 5500U, I get a 105 on the chromium speedometer and a 175 on the Thorium speedometer. Not a 3x score difference but still very significant.
