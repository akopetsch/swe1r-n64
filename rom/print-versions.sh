#!/bin/bash

for rom in swe1r.*.z64; do
  echo $rom
  strings -tx $rom | grep -P "v\d{2}\w{3}\d{2}\.\d{4}"
done
