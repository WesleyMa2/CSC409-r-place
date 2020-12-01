#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int bruteIncrement(char* brute, int alphabetLen, int wordLen, int incrementBy) {
	int i = 0;
	while(incrementBy > 0 && i < wordLen) {
		int add = incrementBy + brute[i];
		brute[i] = (char)(add % alphabetLen);
		incrementBy = add / alphabetLen;
		i++;
	}
	return incrementBy == 0; 
}

void bruteToString(char *brute, int wordLen, char *alphabet, char *out){
	for(int i=0;i<wordLen;i++){
		out[i]=alphabet[brute[i]];
	}
	out[wordLen]='\0';
}

int any(char *list, int listSize){
	for(int i=0;i<listSize;i++){
		if(list[i])return 1;
	}
	return 0;
}

void printWork(char *work, int workLen){
	char *out[] = { "false", "true" };
	for(int i=0;i<workLen;i++){
		printf("%s ", out[work[i]]);
	}
	printf("\n");
}

int searchPart(char *targetString, char *alphabet, char *brute, int workSize, int workerId, int wordLen, int alphabetLen){
	// Go to the start of my work
	if(!bruteIncrement(brute, alphabetLen, wordLen, workSize*workerId)){
        	return 0;
        }
        int count = 0;
	char out[wordLen + 1];
        while(1){
		if(count>=workSize)break;
		bruteToString(brute, wordLen, alphabet, out);
		if(strcmp(out, targetString)==0)return 1;
		count +=1;
		if(!bruteIncrement(brute, alphabetLen, wordLen, 1))break;
        }
        return 0;
}

int search(char *targetString, char *alphabet, int numWorkers, int workSize){
	int wordLen = strlen(targetString);
	int alphabetLen = strlen(alphabet);

	char brute [wordLen]; 
	for(int i=0;i<wordLen;i++)brute[i]=0;

	while(1){
		char work[numWorkers];
		for(int workerId=0;workerId<numWorkers;workerId++){
			char brutePart[wordLen]; // Really probably need another brutePart for each worker
			for(int i=0;i<wordLen;i++)brutePart[i]=brute[i];
			work[workerId]=searchPart(targetString, alphabet, brutePart, workSize, workerId, wordLen, alphabetLen);
		}
		// printWork(work, numWorkers);
		if(any(work, numWorkers))return 1;
	
		// advance to the next major chunk of work
		if(!bruteIncrement(brute, alphabetLen, wordLen, workSize*numWorkers)){
			break;
		}
	}
	return 0;
}

int main( int argc, char** argv) {
	char *targetString = argv[1];
	char *alphabet = argv[2];
	int numWorkers = atoi(argv[3]);
	int workSize = atoi(argv[4]);

	if(search(targetString, alphabet, numWorkers, workSize)){
		printf("found\n");
	} else {
		printf("notfound\n");
	}
}
