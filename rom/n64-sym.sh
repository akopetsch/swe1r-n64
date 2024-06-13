#!/bin/bash

for rom in swe1r.*.z64; do
  echo == $rom ==
  echo -- 2.0I --
  n64sym $rom -l usr/2.0I/lib/
  echo -- 2.0J --
  n64sym $rom -l usr/2.0J/lib/
  echo
done
