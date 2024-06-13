#!/bin/bash

for rom in swe1r.*.z64; do
  echo $rom 
  dd if=$rom of=$rom.boot.bin bs=1 skip=64 count=4032
done
md5sum swe1r.*.z64.boot.bin
