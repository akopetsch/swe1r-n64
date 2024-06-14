#!/usr/bin/env python3

import argparse

def find_subfile(input_file, subfile):
    with open(input_file, 'rb') as f_in:
        input_data = f_in.read()
    
    with open(subfile, 'rb') as f_sub:
        subfile_data = f_sub.read()
    
    offset = input_data.find(subfile_data)
    return offset

def main():
    parser = argparse.ArgumentParser(description='Find the offset of a subfile within a main file.')
    parser.add_argument('input_file', type=str, help='The main binary file.')
    parser.add_argument('subfile', type=str, help='The subfile to search for within the main file.')

    args = parser.parse_args()

    offset = find_subfile(args.input_file, args.subfile)
    if offset != -1:
        print(f"{args.subfile} found at: {hex(offset)}")
    else:
        print(f"{args.subfile} not found.")

if __name__ == "__main__":
    main()
