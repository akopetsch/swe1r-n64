# dump-bootcodes


https://www.retroreversing.com/n64bootcode

```console
$ ./dump-bootcodes.sh
swe1r.eu.z64
4032+0 records in
4032+0 records out
4032 bytes (4.0 kB, 3.9 KiB) copied, 0.861749 s, 4.7 kB/s
swe1r.jp.z64
4032+0 records in
4032+0 records out
4032 bytes (4.0 kB, 3.9 KiB) copied, 0.867947 s, 4.6 kB/s
swe1r.us.z64
4032+0 records in
4032+0 records out
4032 bytes (4.0 kB, 3.9 KiB) copied, 0.864901 s, 4.7 kB/s
e24dd796b2fa16511521139d28c8356b  swe1r.eu.z64.boot.bin
e24dd796b2fa16511521139d28c8356b  swe1r.jp.z64.boot.bin
e24dd796b2fa16511521139d28c8356b  swe1r.us.z64.boot.bin
```

https://github.com/Dragorn421/n64checksum

> There are different IPL3 versions: (thanks Bigbass from the N64brew discord for the following checksums 
> https://discord.com/channels/205520502922543113/205520502922543113/968583064492064869 )
> ```text
> MD5 Hashes (over entire IPL3):
> 6102/7101 = E24DD796B2FA16511521139D28C8356B
> [...]
> ```

The README links an online Excel sheet:

> A list of what games use which CIC https://onedrive.live.com/view.aspx?resid=3E0FF504D0091341!184&ithint=file,xlsx&authkey=!ANIbMGHFVJCPv90

That Excel sheet contains the following lines:

|                                 |              |                   |                                           |     |   |
|---------------------------------|--------------|-------------------|-------------------------------------------|-----|---|
| Star Wars Episode I - Racer (E) | CIC-NUS-7101 | EEPROM (16 Kbits) | Expansion Pak, Rumble Pak, Controller Pak | 256 | 2 |
| Star Wars Episode I - Racer (J) | CIC-NUS-6102 | EEPROM (16 Kbits) | Expansion Pak, Rumble Pak, Controller Pak | 256 | 2 |
| Star Wars Episode I - Racer (U) | CIC-NUS-610  | EEPROM (16 Kbits) | Expansion Pak, Rumble Pak, Controller Pak | 256 | 2 |
