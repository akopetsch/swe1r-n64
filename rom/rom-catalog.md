# rom-catalog

You can find info on the game's N64 releases in the 'Mupen64Plus Rom Catalog':

[github.com - mupen64plus/mupen64plus-core - mupen64plus.ini](https://github.com/mupen64plus/mupen64plus-core/blob/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini)
[[archived]](https://web.archive.org/web/20240608124122/https://github.com/mupen64plus/mupen64plus-core/blob/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini)


```console
$ wget https://github.com/mupen64plus/mupen64plus-core/raw/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini
```

There 12 known ROMs:

```console
$ grep "Star Wars Episode I - Racer" mupen64plus.ini
GoodName=Star Wars Episode I - Racer (E) (M3) [!]
GoodName=Star Wars Episode I - Racer (E) [T+Spa1.0.2_IlDucci]
GoodName=Star Wars Episode I - Racer (E) (M3) [f1] (Save)
GoodName=Star Wars Episode I - Racer (J) [!]
GoodName=Star Wars Episode I - Racer (J) [b1]
GoodName=Star Wars Episode I - Racer (U) [!]
GoodName=Star Wars Episode I - Racer (U) [f1] (Save)
GoodName=Star Wars Episode I - Racer (U) [t1]
GoodName=Star Wars Episode I - Racer (U) [t2]
GoodName=Star Wars Episode I - Racer (U) [t3]
GoodName=Star Wars Episode I - Racer (U) [t4]
GoodName=Star Wars Episode I - Racer (U) (Unl)
```

The codes in the filenames are described by GoodTools:

[emulation.gametechwiki.com - 'GoodTools'](https://emulation.gametechwiki.com/index.php/GoodTools#Good_codes)
[[archived]](https://web.archive.org/web/20240608130331/https://emulation.gametechwiki.com/index.php/GoodTools#Good_codes)

There are three known 'Verified Good Dump' (``[!]``) ROMs:

```console
$ grep "Star Wars Episode I - Racer .* \[!\]" mupen64plus.ini
GoodName=Star Wars Episode I - Racer (E) (M3) [!]
GoodName=Star Wars Episode I - Racer (J) [!]
GoodName=Star Wars Episode I - Racer (U) [!]
```

The following three sections are excerpted from ``mupen64plus.ini`` for those three ROMs:

[mupen64plus.ini#L14867](https://github.com/mupen64plus/mupen64plus-core/blob/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini#L14867)

```ini
[6EF9FED309F28BD59B605F128869AA00]
GoodName=Star Wars Episode I - Racer (E) (M3) [!]
CRC=53ED2DC4 06258002
Players=2
SaveType=Eeprom 16KB
Rumble=Yes
```

[mupen64plus.ini#L14884](https://github.com/mupen64plus/mupen64plus-core/blob/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini#L14884)

```ini
[7579AB0E79B1011479B88F2BF39D48E0]
GoodName=Star Wars Episode I - Racer (J) [!]
CRC=61F5B152 046122AB
Players=2
SaveType=Eeprom 16KB
Rumble=Yes
```

[mupen64plus.ini#L14896](https://github.com/mupen64plus/mupen64plus-core/blob/5340dafcc0f5e8284057ab931dd5c66222d3d49e/data/mupen64plus.ini#L14896)

```ini
[1EE8800A4003E7F9688C5A35F929D01B]
GoodName=Star Wars Episode I - Racer (U) [!]
CRC=72F70398 6556A98B
Players=2
SaveType=Eeprom 16KB
Rumble=Yes
```

Note that the MD5 checksums match the secion names (in square brackets) in ``mupen64plus.ini``:

```console
$ md5sum *.z64
6ef9fed309f28bd59b605f128869aa00  swe1r.eu.z64
7579ab0e79b1011479b88f2bf39d48e0  swe1r.jp.z64
1ee8800a4003e7f9688c5a35f929d01b  swe1r.us.z64
```
