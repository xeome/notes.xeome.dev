---
title: Hashmap
date created: 2023-01-07 02:20
date updated: 2023-01-07 02:30
---

Following text is explanation for this code:
<https://github.com/xeome/data-structures-implementations/blob/master/hashmap.c>

A hash map is a data structure that allows you to store key-value pairs and quickly retrieve the value associated with a given key.

The HashMap data structure consists of a size field, which represents the number of key-value pairs stored in the hash map, a `capacity` field, which represents the maximum number of key-value pairs the hash map can hold, and a `buckets` field, which is an array of pointers to Nodes. Each Node represents a key-value pair, and the buckets array is used to store linked lists of Nodes that have the same hash value.

# hash_map_init

The `hash_map_init` function initializes a hash map by allocating memory for the buckets array and setting the `capacity` and `size` fields to the specified values.

# hash_map_destroy

The `hash_map_destroy` function frees the memory allocated for the buckets array and the Nodes stored in the hash map.

# hash_siphash and hash_djb2

The `hash_siphash` function is a SipHash implementation, which is a cryptographic hash function that can be used to compute a hash value for a given string. The `hash_djb2` function is an alternative, simpler hash function called DJB2.

# hash_map_insert

The `hash_map_insert` function inserts a key-value pair into the hash map. It first computes the hash value for the key using either `hash_siphash` or `hash_djb2`, and then inserts the key-value pair into the linked list at the corresponding index in the buckets array.

# hash_map_lookup

The `hash_map_lookup` function looks up the value associated with a given key in the hash map. It first computes the hash value for the key using either `hash_siphash` or `hash_djb2`, and then searches the linked list at the corresponding index in the buckets array for a Node with the matching key. If a match is found, the function returns the value associated with the key. If no match is found, the function returns -1.

# ROTL

The `ROTL` macro stands for "rotate left" and is used to rotate the bits in the first argument by the number of positions specified in the second argument.

# SIPROUND

The `SIPROUND` macro is used in the implementation of SipHash. It performs a series of operations on the variables v0, v1, v2, and v3 that are intended to scramble the input data in a way that makes it difficult to predict the output hash value based on the input data.

The do { ... } while (0) construct is used in the SIPROUND macro to create a loop that is guaranteed to execute only once. This is a common pattern in C macros, and it is used to ensure that the macro can be used as a single statement without causing syntax errors.

For example, consider the following code:

```C
if (x > 0)
    MACRO;
```

If MACRO is a simple macro that does not contain any control statements, it will be expanded as follows:

```C
if (x > 0)
    statement1;
    statement2;
    ...

```

This will cause a syntax error, because the `if` statement is not properly terminated. To fix this, we can use the `do { ... } while (0)` construct in the macro to ensure that it is always treated as a single statement:

```C
#define MACRO                                                                 \
    do {                                                                     \
        statement1;                                                           \
        statement2;                                                           \
        ...                                                                   \
    } while (0)

```

Now, the macro will be expanded as follows:

```C
if (x > 0)
    do {
        statement1;
        statement2;
        ...
    } while (0);

```

This ensures that the macro can be used as a single statement without causing syntax errors.
