#!/bin/bash
# Run this on dh202xpcXX 

./Search.py thisis abcdefghijklmnopqrstuvwxyz 100 1000
java Search thisis abcdefghijklmnopqrstuvwxyz 100 1000
./Search thisis abcdefghijklmnopqrstuvwxyz 100 1000
./Search this7s abcdefghijklmnopqrstuvwxyz 100 1000

time ./Search.py thisis abcdefghijklmnopqrstuvwxyz 100 1000
time java Search thisis abcdefghijklmnopqrstuvwxyz 100 1000
time ./Search thisis abcdefghijklmnopqrstuvwxyz 100 1000
time ./Search this7s abcdefghijklmnopqrstuvwxyz 100 1000

parallel < jobs
