#!/bin/bash

for rom in swe1r.*.z64; do
  echo $rom
  strings -tx $rom | grep "RSP Gfx"
done
