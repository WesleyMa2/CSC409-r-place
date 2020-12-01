#include<stdio.h>
#define N 1073741824
#define THREADS_PER_BLOCK 512

// TITLE: Vector Addition Threads

// add will be run in parallel, in many threads in a single Thread Block. 
// Each thread knows which thread it is in via threadIdx.x

// y = 1 if e in x[0:n], 0, otherwise
__global__ void find(int n, int e, int *x, int *y){
    int i = threadIdx.x;
    // if (i < 10) printf("%i - %i\n", x[i], e);
    if (i < n && x[i] == e){
        *y = 1;
    }
}

void random_ints(int* a, int n) {
   for (int i = 0; i < n; ++i)a[i] = rand()%1000;
}

int main(void) {

	double size = N*sizeof(int);
    int *a;
    int *y;
    int e = 10;

 	// Allocate Unified Memory – accessible from CPU or GPU
    cudaMallocManaged(&a, size);
    cudaMallocManaged(&y, sizeof(int));
    *y = 0;
    random_ints(a,N);
    a[5] = 10;
	find<<< N/THREADS_PER_BLOCK, THREADS_PER_BLOCK >>>(N, e, a, y);

  	// Wait for GPU to finish before accessing on host
  	cudaDeviceSynchronize();

    // for(int i = 0; i < 10; i++){
    //     printf("%i, ", a[i]);
    // }
	printf("Found %i: %i\n", e, *y);

	// Free memory
	cudaFree(a); cudaFree(y);

	return 0;
}


