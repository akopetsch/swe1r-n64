# find-ucodes

Copy ``ucode.bin`` and ``ucode_boot.bin`` 
from [/ucode/DumpMicrocode.js/dump/](/ucode/DumpMicrocode.js/dump/) 
into this directory and execute ``find-ucodes.sh``:

```
$ ./find-ucodes.sh
== swe1r.eu.z64 ==
ucode.bin found at: 0x9e210
ucode_boot.bin found at: 0x9e140

== swe1r.jp.z64 ==
ucode.bin found at: 0x999b0
ucode_boot.bin found at: 0x998e0

== swe1r.us.z64 ==
ucode.bin found at: 0x98cc0
ucode_boot.bin found at: 0x98bf0
```
