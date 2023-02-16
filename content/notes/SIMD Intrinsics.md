---
title: Improving Performance With SIMD intrinsics
date created: 2023-02-14 17:28
date updated: 2023-02-15 23:22
---

> Modern CPUs increasingly rely on parallelism to achieve peak performance. The most well-known form is task parallelism, which is supported at the hardware level by multiple cores, hyperthreading and dedicated instructions supporting multitasking operating systems. Less known is the parallelism known as instruction level parallelism: the capability of a CPU to execute multiple instructions simultaneously, i.e., in the same cycle(s), in a single thread. Older CPUs such as the original Pentium used this to execute instructions utilizing two pipelines, concurrently with high-latency floating point operations. Typically, this happens transparent to the programmer. Recent CPUs use a radically different form of instruction level parallelism. These CPUs deploy a versatile set of vector operations: instructions that operate on 4 or 8 inputs1 , yielding 4 or 8 results, often in a single cycle. This is known as SIMD: Single Instruction, Multiple Data. To leverage this compute potential, we can no longer rely on the compiler. Algorithms that exhibit extensive data parallelism benefit most from explicit SIMD programming, with potential performance gains of 4x - 8x and more.

Outside of niche areas like high-performance computing, game development, or compiler development, even very experienced C and C++ programmers are largely unfamiliar with SIMD intrinsics.

## Concepts

Registers are used by a CPU to store data for operations. A typical register holds 32 or 64 bits. Some of these registers can be split in to 16bit parts or even single bytes.

Vector registers store 4 (SSE) or 8 (AVX) scalars. This means that the C# or C++ vector remains a vector at the assembler level: rather than storing 4 separate values in 4 registers, we store 4 values in a single vector register. And rather than operating on a, b, c and d separately, we use a single SIMD instruction to perform addition (for example) to all 4 values.

If you're a C++ programmer, you're probably familiar with the basic types like char, short, int, and float. Each of these has a different size: A char has 8 bits, a short has 16, an int has 32, and a float has 32. Because bits are just bits, the only difference between a float and an int is in the interpretation. This enables us to do some nasty things:

```Cpp
int a;
float& b = (float&)a;
```

This creates one integer and a float reference to a. Because variables a and b now share the same memory location, changing one changes the other. An alternative way to achieve this is using a union:

```C
union { int a; float b; };
```

Again, a and b reside in the same memory location. Here’s another example:

```C
union { unsigned int a4; unsigned char a[4]; };
```

This time, a small array of four chars overlaps the 32-bit integer value a4. We can now access the individual bytes in a4 via array a[4]. Note that a4 now basically has four 1-byte ‘lanes’, which is somewhat similar to what we get with SIMD. We could even use a4 as 32 1-bit values, which is an efficient way to store 32 boolean values.

An SSE register is 128 bits in size and is labeled `__m128` if it stores four floats or `__m128i` if it stores ints. For simplicity, we will refer to `__m128` as 'quadfloat' and `__m128i` as 'quadint'. `__m256` ('octfloat') and `__m256i` ('octint') are the AVX versions. To use the SIMD types, we need to include the following headers:

```C
#include "nmmintrin.h" // for SSE4.2
#include "immintrin.h" // for AVX
```

A `__m128` variable contains four floats, so we can use the union trick again:

```C
union { __m128 a4; float a[4]; };
```

Now we can conveniently access the individual floats in the `__m128` vector. We can also create the quadfloat directly:

```C
__m128 a4 = _mm_set_ps( 4.0f, 4.1f, 4.2f, 4.3f );
__m128 b4 = _mm_set_ps( 1.0f, 1.0f, 1.0f, 1.0f );
```

To add them together, we use

```C
__mm_add_ps: __m128 sum4 = _mm_add_ps( a4, b4 );
```

The `__mm_set_ps` and `_mm_add_ps` keywords are called intrinsics. SSE and AVX intrinsics all compile to a single assembler instruction; using these means that we are essentially writing assembler code directly in our program.

# Examples

```C
#include <immintrin.h>
#include <stdio.h>

int main(int argc, char** argv) {
    const int N = 16;
    float a[N], b[N], c[N];
    // Initialize arrays
    for (int i = 0; i < N; i++) {
        a[i] = (float)i;
        b[i] = 2.0f;
    }
    // Perform element-wise addition using vector instructions
    __m256 a_vec, b_vec;
    for (int i = 0; i < N; i += 8) {
        a_vec = _mm256_load_ps(&a[i]);
        b_vec = _mm256_load_ps(&b[i]);
        _mm256_store_ps(&c[i], _mm256_add_ps(a_vec, b_vec));
    }
    // Print the result
    for (int i = 0; i < N; i++) {
        printf("%f + %f = %f\n", a[i], b[i], c[i]);
    }
    return 0;
}
```

This code performs element-wise addition of two arrays a and b, and stores the result in c. The addition is performed using vector instructions from the AVX instruction set, which allows us to operate on 8 elements at a time. This can result in significant performance improvements compared to a scalar implementation, especially on systems with support for hardware acceleration of vector instructions.

# See Also

- <https://stackoverflow.blog/2020/07/08/improving-performance-with-simd-intrinsics-in-three-use-cases/>
- <http://www.cs.uu.nl/docs/vakken/magr/2017-2018/files/SIMD%20Tutorial.pdf>
- <http://ftp.cvut.cz/kernel/people/geoff/cell/ps3-linux-docs/CellProgrammingTutorial/BasicsOfSIMDProgramming.html>
- <https://www.agner.org/optimize/>
- <https://software.intel.com/sites/landingpage/IntrinsicsGuide/>
- <https://en.wikipedia.org/wiki/Advanced_Vector_Extensions>