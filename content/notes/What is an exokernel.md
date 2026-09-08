# What is an exokernel?

An exokernel is a type of operating system (OS) kernel developed by the MIT Parallel and Distributed Operating Systems group. The idea behind exokernels is to impose as few abstractions as possible on application developers, allowing them to make many decisions about hardware abstractions

Traditionally, operating systems provide hardware resources to applications through high-level abstractions such as virtual file systems. Exokernels, on the other hand are designed to be minimalistic, pushing resource management to the application level. They are small in size as their functionality is limited to ensuring protection and multiplexing of resources. This is considerably simpler than the implementation of message passing in microkernels and high-level abstractions in monolithic kernels.

In an exokernel, implemented abstractions are called library operating systems. They can request specific resources such as memory addresses or disk blocks. The kernel's job is to ensure that the requested resource is free and that the application is allowed to access it. This low-level hardware access allows programmers to implement custom abstractions and omit unnecessary ones, most commonly to improve a program's performance.

Exokernels provide no abstractions on top of the hardware they interact with. This allows developers to decide how to allocate resources to applications running on the system. However, this approach means that users of an exokernel must build the rest of the operating system from scratch. This can be complex and comes with risks, which is a major reason why exokernels have not become mainstream.

Exokernels can be seen as an application of the end-to-end principle to operating systems, as they do not force an application program to layer its abstractions on top of other abstractions that were designed with different requirements in mind. For instance, in the MIT Exokernel project, the Cheetah web server stores preformatted Internet Protocol packets on the disk. The kernel provides safe access to the disk by preventing unauthorized reading and writing, but how the disk is abstracted is up to the application or the libraries the application uses.

## Sample Projects

- [ExOS](https://pdos.csail.mit.edu/archive/exo/): Developed by the MIT Parallel and Distributed Operating Systems group, ExOS is one of the earliest and most well-known exokernel projects.
- [Nemesis](https://www.cl.cam.ac.uk/research/srg/netos/projects/archive/nemesis/): This is a concept operating exokernel system written by the University of Cambridge, University of Glasgow, Citrix Systems, and the Swedish Institute of Computer Science.
- [PersiaOS](https://github.com/GeniusesGroup/PersiaOS): This is a distributed operating system based on exokernel (unikernel) concepts.
- [JOS-Exokernel](https://github.com/foreverbell/JOS): This project is an implementation of the core of an exokernel-style operating system.

## References

- <https://en.wikipedia.org/wiki/Exokernel>
- <https://www.techopedia.com/definition/27006/exokernel>
- <https://www.codecademy.com/resources/blog/kernel/>
- <https://wiki.osdev.org/Exokernel>
- <https://www.geeksforgeeks.org/exokernel-in-os/>
- <https://medium.com/@vithushaaarabhi/exokernels-an-operating-system-architecture-for-application-level-resource-management-32d0daaeeab0>
