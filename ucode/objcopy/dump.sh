#!/bin/bash

OBJFILE=gspF3DEX2.NoN.fifo.o
md5sum $OBJFILE
file $OBJFILE
mkdir -p dump
cd dump
objcopy -I elf32-big --only-section=.data -O binary ../$OBJFILE data.bin
objcopy -I elf32-big --only-section=.text -O binary ../$OBJFILE text.bin
md5sum *.bin | tee checksums.md5
echo Strings in .data section:
strings data.bin
