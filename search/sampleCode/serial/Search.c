#include <stdio.h>
#include<string.h>

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

int search(char *targetString, char *alphabetString){
	int wordLen = strlen(targetString);
	int alphabetLen = strlen(alphabetString);

	char brute [wordLen]; 
	char out [wordLen + 1 ];

	for(int i=0;i<wordLen;i++)brute[i]=0;

	do {
		bruteToString(brute, wordLen, alphabetString, out);
		if(strcmp(out, targetString)==0)return 1;
	} while(bruteIncrement(brute, alphabetLen, wordLen, 1));
	return 0;
}

int main( int argc, char** argv) {
	if(search(argv[1], argv[2])){
		printf("found\n");
	} else {
		printf("notfound\n");
	}
}
