---
title: Valgrind
date created: 2022-12-28 21:27
date updated: 2022-12-29 13:35
---

# Overview

Valgrind is a tool that aids in debugging and profiling programs written in C, C++, and other languages. It helps developers identify and fix issues such as memory leaks, buffer overflows, and other problems that can cause bugs and crashes.

Valgrind works by executing a program in a simulated environment and monitoring its behavior. It can identify a variety of problems, including:

- Memory leaks: Valgrind can detect when a program fails to free memory that it has allocated, resulting in an accumulation of unused memory over time.

- Memory errors: Valgrind can detect when a program accesses memory that it is not intended to, such as when it reads from or writes to uninitialized memory or memory that has already been freed.

- Buffer overflows: Valgrind can detect when a program writes more data to a buffer than it is designed to hold, potentially causing a crash or introducing security vulnerabilities.

- Race conditions: Valgrind can detect when multiple threads of a program access shared resources in an inconsistent or conflicting manner, leading to unpredictable or incorrect behavior.

# Common paremeters

Valgrind has many options and parameters that can be used to customize its behavior and the types of problems it can detect. Here are a few of the more commonly used options:

- `--leak-check=full`: This option enables Valgrind's memory leak detection features, and provides a detailed report of any memory that was allocated but not freed by the program.

- `--track-origins=yes`: This option enables Valgrind's origin tracking feature, which can help identify the source of uninitialized memory reads and other errors.

- `--tool=<toolname>`: This option allows you to specify which tool Valgrind should use to analyze the program. Valgrind comes with a number of different tools, including `memcheck` for memory error detection, `cachegrind` for cache profiling, and `helgrind` for detecting threading errors.

- `--log-file=<filename>`: This option specifies a file to which Valgrind should write its output. By default, Valgrind writes its output to `stderr`, but this option allows you to redirect the output to a file for easier analysis.

- `--suppressions=<filename>`: This option specifies a file containing suppression rules that tell Valgrind to ignore certain errors or warnings. This can be useful if you are running Valgrind on a program that generates a lot of false positives or if you are only interested in certain types of errors.

These are just a few examples of the many options and parameters that are available in Valgrind.

# More examples

Example 1: How Valgrind can be used to detect a memory leak in a C program:

```C
#include <stdlib.h>

int main(int argc, char** argv) {
  char* ptr = (char*) malloc(100);
  // Do something with ptr
  return 0;
}

```

If we compile and run this program using Valgrind, it will report that there is a 100-byte memory leak, because the program allocated memory with `malloc` but did not release it with `free`.

```bash
$ valgrind --leak-check=full ./a.out
==4410== Memcheck, a memory error detector
==4410== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==4410== Using Valgrind-3.19.0 and LibVEX; rerun with -h for copyright info
==4410== Command: ./a.out
==4410==
==4410==
==4410== HEAP SUMMARY:
==4410==     in use at exit: 100 bytes in 1 blocks
==4410==   total heap usage: 1 allocs, 0 frees, 100 bytes allocated
==4410==
==4410== 100 bytes in 1 blocks are definitely lost in loss record 1 of 1
==4410==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==4410==    by 0x109151: main (mem_leak.c:4)
==4410==
==4410== LEAK SUMMARY:
==4410==    definitely lost: 100 bytes in 1 blocks
==4410==    indirectly lost: 0 bytes in 0 blocks
==4410==      possibly lost: 0 bytes in 0 blocks
==4410==    still reachable: 0 bytes in 0 blocks
==4410==         suppressed: 0 bytes in 0 blocks
==4410==
==4410== For lists of detected and suppressed errors, rerun with: -s
==4410== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
```

Example 2: Detecting a buffer overflow:

```C
#include <stdio.h>

int main(int argc, char** argv) {
  char *buffer = malloc(10);
  snprintf(buffer, 20, "Hello, world!"); // buffer is too small
  printf("%s\n", buffer);
  return 0;
}
```

Valgrind is not the best tool for detecting static buffer overflows, but because the code uses dynamically allocated buffers, it works fine.
When we run this program through Valgrind, we get an error because the program tries to write more data to the buffer than it was designed to hold:

```bash
$ valgrind --leak-check=full ./a.out
==6888== Memcheck, a memory error detector
==6888== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==6888== Using Valgrind-3.19.0 and LibVEX; rerun with -h for copyright info
==6888== Command: ./a.out
==6888==
==6888== Invalid write of size 1
==6888==    at 0x48FF7A5: _IO_default_xsputn (genops.c:394)
==6888==    by 0x48FF7A5: _IO_default_xsputn (genops.c:370)
==6888==    by 0x48D8932: outstring_func (vfprintf-internal.c:239)
==6888==    by 0x48D8932: __vfprintf_internal (vfprintf-internal.c:767)
==6888==    by 0x48FAA9D: __vsnprintf_internal (vsnprintf.c:114)
==6888==    by 0x48D4FA5: snprintf (snprintf.c:31)
==6888==    by 0x109192: main (buffer_overflow.c:6)
==6888==  Address 0x4a6904a is 0 bytes after a block of size 10 alloc'd
==6888==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x109171: main (buffer_overflow.c:5)
==6888==
==6888== Invalid write of size 1
==6888==    at 0x48FAAAA: __vsnprintf_internal (vsnprintf.c:117)
==6888==    by 0x48D4FA5: snprintf (snprintf.c:31)
==6888==    by 0x109192: main (buffer_overflow.c:6)
==6888==  Address 0x4a6904d is 3 bytes after a block of size 10 alloc'd
==6888==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x109171: main (buffer_overflow.c:5)
==6888==
==6888== Invalid read of size 1
==6888==    at 0x4847D14: strlen (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x48F3AB7: puts (ioputs.c:35)
==6888==    by 0x10919E: main (buffer_overflow.c:7)
==6888==  Address 0x4a6904a is 0 bytes after a block of size 10 alloc'd
==6888==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x109171: main (buffer_overflow.c:5)
==6888==
==6888== Invalid read of size 1
==6888==    at 0x48FF713: _IO_default_xsputn (genops.c:399)
==6888==    by 0x48FF713: _IO_default_xsputn (genops.c:370)
==6888==    by 0x48FDB34: _IO_new_file_xsputn (fileops.c:1264)
==6888==    by 0x48FDB34: _IO_file_xsputn@@GLIBC_2.2.5 (fileops.c:1196)
==6888==    by 0x48F3B6B: puts (ioputs.c:40)
==6888==    by 0x10919E: main (buffer_overflow.c:7)
==6888==  Address 0x4a6904a is 0 bytes after a block of size 10 alloc'd
==6888==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x109171: main (buffer_overflow.c:5)
==6888==
Hello, world!
==6888==
==6888== HEAP SUMMARY:
==6888==     in use at exit: 10 bytes in 1 blocks
==6888==   total heap usage: 2 allocs, 1 frees, 1,034 bytes allocated
==6888==
==6888== 10 bytes in 1 blocks are definitely lost in loss record 1 of 1
==6888==    at 0x4841888: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==6888==    by 0x109171: main (buffer_overflow.c:5)
==6888==
==6888== LEAK SUMMARY:
==6888==    definitely lost: 10 bytes in 1 blocks
==6888==    indirectly lost: 0 bytes in 0 blocks
==6888==      possibly lost: 0 bytes in 0 blocks
==6888==    still reachable: 0 bytes in 0 blocks
==6888==         suppressed: 0 bytes in 0 blocks
==6888==
==6888== For lists of detected and suppressed errors, rerun with: -s
==6888== ERROR SUMMARY: 12 errors from 5 contexts (suppressed: 0 from 0)
```
