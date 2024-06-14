#!/bin/bash

for rom in swe1r.*.z64; do
    echo == $rom ==
    ./find-subfile.py $rom ucode.bin
    ./find-subfile.py $rom ucode_boot.bin
    echo
done
