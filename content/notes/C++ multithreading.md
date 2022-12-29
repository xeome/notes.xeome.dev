---
title: C++ multithreading
date created: 2022-12-29 21:37
date updated: 2022-12-30 00:54
---

# Overview

Multithreading is a programming technique that allows a single process to execute multiple threads concurrently. This allows a program to perform multiple tasks simultaneously, improving the performance and responsiveness of the program. In C++, the `std::thread` class, part of the C++11 standard library, is used to implement multithreading.

To use concurrency in C++, you will need to use the `<thread>` header, which provides the `std::thread` class and other related types and functions for creating and managing threads. Here's a simple example of how to create and start a new thread:

```cpp
#include <iostream>  
#include <thread>  
  
void foo() { std::cout << "Hello from a new thread!" << std::endl; }  
  
int main() {  
    std::thread t(foo);  
    t.join();  
    return 0;  
}
```

This program creates a new `std::thread` object, passing the function `foo` as the argument to the thread's constructor. The `join` member function blocks the calling thread (in this case, the main thread) until the new thread has completed execution.

You can also use the `std::async` function to run a function asynchronously and get a `std::future` object that can be used to retrieve the result of the function when it becomes available. For example:

```cpp
#include <future>  
#include <iostream>  
  
int foo() { return 10; }  
  
int main() {  
    std::future<int> f = std::async(foo);  
    int x = f.get();  
    std::cout << "x = " << x << std::endl;  
    return 0;  
}
```

This program creates a new asynchronous task that executes the `foo` function and returns a `std::future` object that can be used to retrieve the result of the function when it becomes available. The `get` member function of the `std::future` object blocks the calling thread until the result is available, and then returns the result.

# Basic examples

##### Example 1: Passing arguments to a thread function

In this example, we pass two arguments to the thread function:

```cpp
#include <iostream>  
#include <thread>  
  
void foo(int x, std::string str) {  
    std::cout << "x = " << x << ", str = " << str << std::endl;  
}  
  
int main() {  
    std::thread t(foo, 10, "Hello");  
    t.join();  
    return 0;  
}

```

When the `foo` function is executed by the new thread, it will receive the arguments `10` and `"Hello"`.

##### Example 2: Using std::move to transfer ownership of a thread

In this example, we use `std::move` to transfer ownership of a thread object to a new thread:

```cpp
#include <iostream>  
#include <thread>  
  
void foo() { std::cout << "Hello from a new thread!" << std::endl; }  
  
int main() {  
    std::thread t1(foo);  
    std::thread t2 = std::move(t1);  
    t2.join();  
    return 0;  
}
```

The `t1` thread object is created and starts executing the `foo` function. The `t2` thread object is then created by moving the `t1` object using `std::move`. This transfers ownership of the thread to the `t2` object, and the `t1` object is left in a moved-from state and is no longer associated with any thread. The `t2` object can then be used to manage the thread.

##### Example 3: Detaching a thread

In this example, we create a thread and detach it from the main thread of execution:

```cpp
#include <iostream>  
#include <thread>  
  
void foo() { std::cout << "Hello from a new thread!" << std::endl; }  
  
int main() {  
    std::thread t(foo);  
    t.detach();  
    return 0;  
}

```

The `detach` member function of the `std::thread` object detaches the thread from the main thread of execution, allowing it to run independently. The main thread can then continue execution without waiting for the detached thread to complete.

##### Example 4: Passing arguments by reference to std::thread

In this example, we pass an argument by reference to thread function:

```cpp
#include <iostream>  
#include <thread>  
  
void foo(int x, std::string &str) {  
    std::cout << "x = " << x << ", str = " << str << std::endl;  
}  
  
int main() {  
    std::string str = "Hello";  
    std::thread t(foo, 10, std::ref(str));  
    t.join();  
    return 0;  
}
```

# More algorithmic examples

There are many other algorithms that can be implemented as multithreaded versions to take advantage of concurrency, including the following:

- Sorting algorithms: Many sorting algorithms, such as merge sort and quick sort, can be implemented as multithreaded versions to improve performance on multi-core systems.

- Matrix multiplication: Matrix multiplication can be implemented as a multithreaded algorithm to take advantage of parallelism, particularly for large matrices.

- Graph algorithms: Many graph algorithms, such as breadth-first search and depth-first search, can be implemented as multithreaded versions to improve performance on multi-core systems.

- Search algorithms: Some search algorithms, such as binary search and linear search, can be implemented as multithreaded versions to improve performance on multi-core systems.

### Example 1: Merge sort

```cpp
#include <iostream>
#include <thread>

void merge(int arr[], int l, int m, int r) {

    // Find sizes of two sub arrays to be merged
    int i, j, k;
    int n1 = m - l + 1;
    int n2 = r - m;

    // create temp arrays
    int L[n1], R[n2];

    // Copy data to temp arrays L[] and R[]
    std::copy(arr + l, arr + l + n1, L);
    std::copy(arr + m + 1, arr + m + 1 + n2, R);

    // Merge the temp arrays back into arr[l..r]
    i = 0; // Initial index of first subarray
    j = 0; // Initial index of second subarray
    k = l; // Initial index of merged subarray
    while (i < n1 && j < n2) {
        // if left subarray is smaller than right subarray then put left
        // subarray element into arr and increment i and k by 1 otherwise put
        // right subarray element into arr and increment j and k by 1
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }

    // Copy the remaining elements of L[], if there are any 
    std::copy(L + i, L + n1, arr + k);

    // Copy the remaining elements of R[], if there are any 
    std::copy(R + j, R + n2, arr + k);
}

// Parallel version of the merge sort algorithm
void mergeSort(int *arr, int l, int r) {
    if (l < r) {
        // Same as (l+r)/2, but avoids overflow for large l and h
        int m = l + (r - l) / 2;
        // Sort first and second halves
        std::thread t1(mergeSort, arr, l, m);
        std::thread t2(mergeSort, arr, m + 1, r);
        t1.join();
        t2.join();
        // Merge the sorted halves
        merge(arr, l, m, r);
    }
}

int main() {
    // Test the merge sort algorithm
    int arr[] = {12, 11, 13, 5, 6, 7};
    int arr_size = std::size(arr);

    std::cout << "Given array is \n";
    for (int i = 0; i < arr_size; i++)
        std::cout << arr[i] << " ";

    mergeSort(arr, 0, arr_size - 1);

    std::cout << "\nSorted array is \n";
    for (int i = 0; i < arr_size; i++)
        std::cout << arr[i] << " ";
    return 0;
}
```
