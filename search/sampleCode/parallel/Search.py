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

# search consecutive strings in a workSize chunk for targetString
def searchPart(targetString, alphabet, brute, workSize, workerId):
    # Go to the start of my work
    if not bruteIncrement(brute, len(alphabet), workSize*workerId): 
        return False

    count = 0
    while True:
        if count>=workSize: break
        if targetString==bruteToString(brute, alphabet): return True
        count +=1
        if not bruteIncrement(brute, len(alphabet), 1): break
    return False

# The start of a parallel algorithm for search
def search(targetString, alphabetString, numWorkers, workSize):
    alphabet=list(alphabetString)
    brute = [ 0 for i in range(len(targetString)) ]

    while True:
        work = []
        for workerId in range(numWorkers):
            brutePart = brute[:]
            work.append(searchPart(targetString, alphabet, brutePart, workSize, workerId))

        # print(work)
        if any(work): return True

        # advance to the next major chunk of work
        if not bruteIncrement(brute, len(alphabet), workSize*numWorkers): 
            break
    return False

if __name__ == "__main__":
    targetString = sys.argv[1]
    alphabetString = sys.argv[2]
    numWorkers = int(sys.argv[3])
    workSize = int(sys.argv[4])

    if search(targetString, alphabetString, numWorkers, workSize):
        print("found")
    else:
        print("notfound")
