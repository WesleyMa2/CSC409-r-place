#include <stdio.h>
#include <string.h>
#include <stdlib.h>

const char TRUE = 1;
const char FALSE = 0;


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

__device__ void cudaStrCmp(char *a, char *b, int len, int* res) {
	int workerId = threadIdx.x;
	for (int i = 0; i < len; i++) {
		if (a[i] != b[i]) {
			*res = 0;
			return;
		}
	}
}

__device__ void k_bruteIncrement(char* brute, int alphabetLen, int wordLen, int incrementBy, int *incRes) {
	int i = 0;
	int workerId = threadIdx.x;
	
	while(incrementBy > 0 && i < wordLen) {
		int add = incrementBy + brute[i]; 
		brute[i] = (char)(add % alphabetLen); 
		incrementBy = add / alphabetLen;
		i++;
	}
	*incRes = incrementBy == 0;
}

__device__ void bruteToString(char *brute, int wordLen, char *alphabet, char *out){
	for(int i=0;i<wordLen;i++){
		out[i]=alphabet[brute[i]];
	}
	out[wordLen]='\0';
}

int any(int *list, int listSize){
	for(int i=0;i<listSize;i++){
		if(list[i])return TRUE;
	}
	return FALSE;
}

__global__ void searchPart(char *targetString, char *alphabet, char *brutePart, int workSize, int wordLen, int alphabetLen, int* results){
	int workerId = threadIdx.x;
	results[workerId] = 0;
	int incRes = FALSE;

	// Receive start of latest section (WORKER * WORKSIZE), create local copy
	char* t_brutePart = (char *) malloc((wordLen)* sizeof(char));
	for (int i = 0; i < wordLen; i++) t_brutePart[i] = brutePart[i];
	
	// Increment to start of this thread's chunk (WORKSIZE)
	k_bruteIncrement(t_brutePart, alphabetLen, wordLen, workSize*workerId, &incRes);

	if(!incRes){
		return;
	}
	int count = 0;
	char* out = (char *) malloc((wordLen + 1)* sizeof(char));

	// Increment by one and compare strs after every iteration
	while(1) {
		if(count>=workSize) {
			break;
		}
		bruteToString(t_brutePart, wordLen, alphabet, out);
		int cmpRes = 1;
		cudaStrCmp(out, targetString, wordLen, &cmpRes);
		if(cmpRes == 1) { 
			results[workerId] = 1;
			break;
		}
		count +=1;
		incRes = 0;
		k_bruteIncrement(t_brutePart, alphabetLen, wordLen, 1, &incRes);
		if(!incRes) {
			break;
        }
	}
	free(out);
	free(t_brutePart);
}
int search(char *targetString, char *alphabet, int numWorkers, int workSize){
	int wordLen = strlen(targetString);
    int alphabetLen = strlen(alphabet);
    int size = wordLen*sizeof(char);
    int alphabetSize = alphabetLen*sizeof(char);

    char *k_alphabet;
    int *k_alphabetLen;
    int *k_wordLen;
    char *k_targetString;

    cudaMallocManaged(&k_alphabet, alphabetSize);
    cudaMallocManaged(&k_alphabetLen, sizeof(int));
    cudaMallocManaged(&k_wordLen, sizeof(int));
    cudaMallocManaged(&k_targetString, size);
    cudaMemcpy(k_alphabet, alphabet, alphabetSize, cudaMemcpyDefault );
	cudaMemcpy(k_targetString, targetString, size, cudaMemcpyDefault );
	*k_alphabetLen = strlen(alphabet);
	*k_wordLen = strlen(targetString);

	char brute [wordLen];
	for(int i=0;i<wordLen;i++)brute[i]=0; 

	char* k_brutePart;
	cudaMalloc(&k_brutePart, size);

	int* k_results;
	cudaMallocManaged(&k_results, numWorkers* sizeof(int));

	int* results = (int*)malloc(sizeof(int) * numWorkers);
	// Every iteration, increment brute (WORKERS * WORKSIZE) times
	while(1){

		cudaMemcpy(k_brutePart, brute, size, cudaMemcpyDefault );
		for(int i=0;i<numWorkers;i++) k_results[i] = 0;

		// Divide the section into chunks to be worked on in parallel
        searchPart<<<1, numWorkers>>>(k_targetString, k_alphabet, k_brutePart, workSize, *k_wordLen, *k_alphabetLen, k_results);
		
		// Wait for GPU to finish before accessing on host
		cudaDeviceSynchronize();

		if(any(k_results, numWorkers)) return 1;

		// advance to the next major chunk of work
		if(!bruteIncrement(brute, alphabetLen, wordLen, workSize*numWorkers)){
			break;
		}
	}
	cudaFree(k_alphabet);
	cudaFree(k_alphabetLen);
	cudaFree(k_wordLen);
	cudaFree(k_targetString);
	cudaFree(k_brutePart);
	cudaFree(k_results);
	return 0;
}

int main( int argc, char** argv) {
	char *targetString = argv[1];
	char *alphabet = argv[2];
	int numWorkers = atoi(argv[3]);
	int workSize = atoi(argv[4]);
	printf("Looking for %s in [%s]...\n", targetString, alphabet);
	if(search(targetString, alphabet, numWorkers, workSize)){
		printf("Found\n");
	} else {
		printf("Notfound\n");
	}

	return 0;
}