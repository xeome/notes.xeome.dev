---
title: Optimizing images
date created: 2023-01-19 21:47
date updated: 2023-01-22 01:42
---

# Overview

Image optimization is the process of reducing the file size of an image without compromising its visual quality. Optimizing images can improve the speed and performance of a website or application, as well as reduce data usage and improve the user experience. This documentation will provide an in-depth look at the various techniques and tools available for optimizing images as well as best practices for implementing image optimization in your projects.

Lossy and lossless compression are 2 types of compression. Lossy compression algorithms discards some of the data in order to achieve a smaller file size. This can result in visible artifacts and a degradation of image quality (although with good settings it can be very hard to notice), but the compression ratio is usually much higher than lossless compression. Lossless compression algorithms do not discard any image data as the name suggests. This results in a lower compression ratio. The most common lossless image compression formats include PNG and GIF while JPEG is the most widely used lossy image compression format. It's important to consider the purpose of the image and the intended audience when choosing between lossy and lossless compression. If the image will be used for professional or critical applications lossless compression is recommended, while lossy compression may be more suitable for casual or web-based applications.

There are a lot of different image formats out there, and some aren't as good at compression as others, but they might work better with certain things. I personally like WEBP because it has both lossless and lossy compression options and it's pretty popular. This guide will also show you how to get the best compression with each format. If you don't care about compatibility and just want to shrink the file size as much as possible you can try using less mainstream formats like AVIF or JPEG XL (not to be confused with regular JPEG).

# Optimizing PNG Files

I personally optimize with oxipng, a multithreaded lossless PNG compression optimizer. Because it is a command line tool, it may not be appropriate for non-power users.

## Examples:

#### Optimizing Every .png File In A Directory

```C
oxipng -o max --strip safe *.png
```

This command will optimize all png files in the current directory. This command provides nearly maximum optimization; further optimization can be obtained by including the -Z flag, which enables a slower but better compressing Zopfli algorithm; I did not include it because it significantly lengthens the optimization process.

`-o max` sets optimization level to maximum, its a stable alias for maximum compression.

## Optimization Levels for Oxipng

Optimization levels:

```C
-o 0   => --zc 5  --fast             (1 trial, determined heuristically)
-o 1   => --zc 10 --fast             (1 trial, determined heuristically)
-o 2   => --zc 11 -f 0,1,6,7 --fast  (1 trial, determined by fast evaluation)
-o 3   => --zc 11 -f 0,7,8,9         (4 trials)
-o 4   => --zc 12 -f 0,7,8,9         (4 trials; same as `-o 3` for zopfli)
-o 5   => --zc 12 -f 0,1,2,5,6,7,8,9 (8 trials)
-o 6   => --zc 12 -f 0-9             (10 trials)
-o max =>                            (stable alias for the max compression)
```

# Optimizing WEBP

### Lossless

Following command can be used to losslessly compress a png file to webp with highest compression settings:

```C
cwebp -quiet -v -mt -lossless -z 9 input.png -o output.webp
```

`-mt` Use multi-threading for encoding, if possible.

`-lossless`  Enable lossless compression.

`-m 6` This parameter controls the trade off between encoding speed and the compressed file size and quality.  Possible
values range from 0 to 6. Default value is 4.  When higher values are used, the encoder will spend more time inspecting additional encoding  possibilities  and  decide on the quality gain.  Lower value can result in faster processing time at the expense of larger file size and lower compression quality.

### Lossy

Following command can be used to lossy compress a png file to webp with highest compression settings:

```C
cwebp -quiet -v -mt -af -m 6 -q 97 input.png -o output.webp
```

`-mt` Use multi-threading for encoding, if possible.

`-af` Turns auto-filter on. This algorithm will spend additional time optimizing the filtering strength to reach a well-balanced quality.

`-m 6` This parameter controls the trade off between encoding speed and the compressed file size and quality.  Possible
values range from 0 to 6. Default value is 4.  When higher values are used, the encoder will spend more time inspecting additional encoding  possibilities  and  decide on the quality gain.  Lower value can result in faster processing time at the expense of larger file size and lower compression quality.

`-q 97` Controls quality level.

Additionally, `-hint` can be used to specify a hint about the type of input image. The following values are possible: photo, picture or graph. By knowing what type of data is being compressed, webp can potentially achieve higher compression.

# See Also

- <https://github.com/shssoichiro/oxipng>
- <https://developers.google.com/speed/webp/docs/cwebp>
- <https://github.com/libjxl/libjxl>