---
title: Data Structures
date created: 2022-12-28 21:14
date updated: 2023-01-07 02:34
---

# Overview

There are numerous data structures used in computer science and software engineering, each with their own set of characteristics and trade-offs. Here's a quick rundown of some of the most common data structures, as well as their use cases and time complexities for common operations:

1. Arrays: Arrays are simple data structures that store a fixed-size sequence of elements. They perform well when accessing individual elements but poorly when inserting or deleting elements. Time complexity for common operations:

- Access: O(1)
- Insertion/Deletion: O(n)

2. Vectors: Vectors are similar to arrays, but they are mutable and have automatic resizing. Time complexity for common operations:

- Access: O(1)
- Insertion/Deletion: O(n)

3. Linked Lists: Linked lists are data structures that store a list of elements, each of which contains a reference to the next element in the list. They perform well when inserting and deleting elements but poorly when accessing individual elements. Time complexity for common operations:

- Access: O(n)
- Insertion/Deletion: O(1)

4. Stacks: Stacks are data structures that store a sequence of elements and allow only the most recently added element to be accessed (last in, first out). They perform well when adding and removing elements from the top of the stack, but poorly when accessing other elements. Time complexity for common operations:

- Access: O(n)
- Insertion/Deletion: O(1)

5. Queues: Queues are data structures that store a sequence of elements and allow only the oldest element to be accessed (first in, first out). They perform well when adding and removing elements from the front and back of the queue, but poorly when accessing other elements. Time complexity for common operations:

- Access: O(n)
- Insertion/Deletion: O(1)

6. Trees: Trees are hierarchical data structures made up of nodes connected by a parent-child relationship. They are good at searching, inserting, and deleting elements, but not so good at accessing individual elements. Time complexity for common operations:

- Access: O(n)
- Insertion/Deletion: O(log n)

7. Hash Tables: Hash tables are data structures that map keys to array indices using a hash function. They are good at searching, inserting, and deleting elements, but not so good at accessing individual elements. Time complexity for common operations:

- Access: O(1) average case, O(n) worst case
- Insertion/Deletion: O(1) average case, O(n) worst case

8. Heaps: Heaps are data structures that store a complete binary tree in which the parent node is always greater than or equal to its children (max heap) or less than or equal to its children (min heap). They are good at finding the maximum or minimum element, but not so good at inserting or deleting elements. Time complexity for common operations:

- Access: O(1)
- Insertion/Deletion: O(log n)

# Implementations

## Vector

Methods available:

- size() - the number of items it can hold
- capacity() - the number of items it can hold
- is_empty()
- at(index) - returns the item at the given index, but fails if the index is out of bounds.
- push(item)
- insert(index, item) - inserts item at index, shifts that index's value and trailing elements to the right
- prepend(item) - inserts item at index 0
- pop() - remove from the end and return the value
- delete(index) - Remove the item at index by shifting all trailing elements to the left.
- remove(item) - searches for value and removes the index that holds it (even if in multiple places)
- find(item) - searches for a value and returns the first index containing that value. If not found, return -1
- resize(new capacity) - When you reach capacity, when popping an item, resize to double the size; if size is 1/4 of capacity, resize to half.

Implementation:
<https://github.com/xeome/data-structures-implementations/blob/master/vector.c>

## Linked List

Methods available:

- size() - returns number of data elements in list
- empty() - bool returns true if empty
- value_at(index) - returns the value of the nth item (starting at 0 for first)
- push_front(value) - adds an item to the front of the list
- pop_front() - remove front item and return its value
- push_back(value) - adds an item at the end
- pop_back() - removes end item and returns its value
- front() - get value of front item
- back() - get value of end item
- insert(index, value) - insert value at index, so current item at that index is pointed to by new item at index
- erase(index) - removes node at given index
- value_n_from_end(n) - returns the value of the node at nth position from the end of the list
- reverse() - reverses the list
- remove_value(value) - removes the first item in the list with this value

Implementation:
<https://github.com/xeome/data-structures-implementations/blob/master/linked_list.c>

## Queue

Methods available:

- enqueue(value) - adds item at end of available storage
- dequeue() - returns value and removes least recently added element
- empty()
- full()

Implementation:
<https://github.com/xeome/data-structures-implementations/blob/master/queue.c>

## Hashmap

Methods available:

- hash_map_init
- hash_map_destroy
- hash_siphash
- hash_map_insert
- hash_map_lookup

Implementation:
<https://github.com/xeome/data-structures-implementations/blob/master/hashmap.c>

Explanation:
[[notes/Hashmap]]
