# DumpMicrocode.js

[hack64.net - 'Fast3D Microcodes'](https://hack64.net/Thread-Fast3D-Microcodes)
[[archived]](https://web.archive.org/web/20240608132342/https://hack64.net/Thread-Fast3D-Microcodes)

The attached script ``DumpMicrocode.js`` can be used with Project64 to extract the microcode(s). 

Put the file into the ``Scripts`` directory under the Project64 installation directory. 
Start the game and execute the script like described in the
[Project64 JavaScript API documentation](https://hack64.net/docs/pj64d/apidoc.php)
[[archived]](https://web.archive.org/web/20240608135124/https://hack64.net/docs/pj64d/apidoc.php).

Note that you have to install a specific Project64 version:  
The OP said (in 2018/2019) you have to compile Project64 from the GitHub repository (probably because the latest public release did not have the required JavaScript API). 
So I downloaded the
[latest development build](https://www.pj64-emu.com/nightly-builds)
[[archived]](https://web.archive.org/web/20240608134616/https://www.pj64-emu.com/nightly-builds)
which gave the following error when trying to execute the script:

```text
ReferenceError: identifier 'rom' undefined
    at [anon] (duktape.cpp:83878) internal
    at global (DumpMicrocode.js:1) strict preventsyield
```

Even replacing ``rom`` with ``mem`` in ``DumpMicrocode.js`` does not help. 
(The current API documents ``mem.getstring(address[, length])``.)
So I downloaded and used the
[latest public release](https://www.pj64-emu.com/public-releases)
[[archived]](https://web.archive.org/web/20240607040637/https://www.pj64-emu.com/public-releases)
which worked.

I started the emulation twice for each of the three ROMs, then each time waited until about the start menu screen and ran the script...

The console output is different for the three ROMs and saved under [log/](log/). 
The following code snippet describes the log schema (that is always the same) where you have to replace 
``P_SIGNATURE``, ``P_OVERLAY_1``, ``P_OVERLAY_2``, ``P_OSTASK`` with the actual values for the ROMs:

```text
Finding microcode signatures in "STAR WARS EP1 RACER " ...
Found signature "RSP Gfx ucode F3DEX.NoN   fifo 2.08  Yoshitaka Yasumoto 1999 Nintendo.
" at address 0xP_SIGNATURE
  Finding overlays table...
  Found 2 possible overlay entries at address: 0xP_OVERLAY_1
  Microcode size = 0x1188
  Found 2 possible overlay entries at address: 0xP_OVERLAY_2
  Microcode size = 0x1390
  Finding OSTask structures...
  Found OSTask structure at 0xP_OSTASK
    Dumping microcode to "RSPDUMP/STAR WARS EP1 RACER/RSP Gfx ucode F3DEX.NoN   fifo 2.08  Yoshitaka Yasumoto 1999 Nintendo.(P_SIGNATURE)"
    Dumping OSTask to "RSPDUMP/STAR WARS EP1 RACER/RSP Gfx ucode F3DEX.NoN   fifo 2.08  Yoshitaka Yasumoto 1999 Nintendo.(P_SIGNATURE)/OSTasks"
Done.
```

The output shows that 
``RSP Gfx ucode F3DEX.NoN   fifo 2.08  Yoshitaka Yasumoto 1999 Nintendo.\n`` 
is the string signature.

The directory ``RSPDUMP`` is created by the script under the Project64 installation directory. 
The sub-directory ``RSPDUMP/STAR WARS EP1 RACER/RSP Gfx ucode F3DEX.NoN   fifo 2.08  Yoshitaka Yasumoto 1999 Nintendo.(P_SIGNATURE)``
contains the following files where you have to replace ``P_OSTASK`` with the actual value for the ROMs:

```text
OSTasks/OSTask_P_OSTASK.bin
ucode.bin
ucode_boot.bin
ucode_data.bin
```

 The files ``OSTasks/OSTask_P_OSTASK.bin`` and ``ucode_data.bin`` are different for every dump, even for two dumps of the same ROM. 

The following table shows which files are different for each dump and how they relate to the sections of the [sections of the object file](/ucode/objcopy/). Note that files are different even for two dumps of the same ROM.

| File                            | Different? | Notes |
|---------------------------------|-----|--------------|
| ``OSTasks/OSTask_P_OSTASK.bin`` | Yes | TODO: ? |
| ``ucode.bin``                   | No  | Equals ``.text`` section. |
| ``ucode_boot.bin``              | No  | TODO: ? |
| ``ucode_data.bin``              | Yes | Starts with ``.data`` section. (TODO: What follows?) |

## OSTask Structure

The post mentions the OSTask structure. You can find the official documentation here:

[ultra64.ca - 'Nintendo 64 Functions Reference Manual' (OS2.0I) - 'OSTask Structure'](https://ultra64.ca/files/documentation/online-manuals/functions_reference_manual_2.0i/os/OSTask.html)
[[archived]](https://web.archive.org/web/20240608132856/https://ultra64.ca/files/documentation/online-manuals/functions_reference_manual_2.0i/os/OSTask.html)
