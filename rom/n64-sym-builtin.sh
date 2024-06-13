#!/bin/bash

for rom in swe1r.*.z64; do
  echo == $rom ==
  n64sym $rom -s | tee $rom.n64sym.txt
  echo
done
