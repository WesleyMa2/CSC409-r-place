#!/usr/bin/python3
import sys

def bruteIncrement(brute, alphabetLen, incrementBy):
    i = 0
    while incrementBy > 0 and i < len(brute):
        add = incrementBy + brute[i]
        brute[i] = add % alphabetLen
        incrementBy = add // alphabetLen
        i+=1
    return incrementBy == 0

def bruteToString(brute, alphabet):
    return "".join([ alphabet[c] for c in brute ])

def search(targetString, alphabetString):
    brute = [ 0 for i in range(len(targetString)) ]
    alphabet=list(alphabetString)
    isDone=False;
    while True:
        if targetString==bruteToString(brute, alphabet): return True
        if not bruteIncrement(brute, len(alphabet), 1): break
    return False

if __name__ == "__main__":
    if search(sys.argv[1], sys.argv[2]):
        print("found")
    else:
        print("notfound")
