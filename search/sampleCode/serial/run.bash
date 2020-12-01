#!/bin/bash
# Run this on dh202xpcXX 

./Search.py thisis abcdefghijklmnopqrstuvwxyz 
java Search thisis abcdefghijklmnopqrstuvwxyz
./Search thisis abcdefghijklmnopqrstuvwxyz
./Search this7s abcdefghijklmnopqrstuvwxyz

time ./Search.py thisis abcdefghijklmnopqrstuvwxyz
time java Search thisis abcdefghijklmnopqrstuvwxyz
time ./Search thisis abcdefghijklmnopqrstuvwxyz
time ./Search this7s abcdefghijklmnopqrstuvwxyz

parallel < jobs
