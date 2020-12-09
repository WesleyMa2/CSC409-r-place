import org.apache.spark._

type Brute = (Array[Int], Boolean);
def bruteIncrement(bruteOg: Brute, alphabetLen: Int, incrementBy: Long): Brute = {
    var i = 0
    val brute = (bruteOg._1.clone, bruteOg._2)
    var increment = incrementBy.toInt
    while(increment > 0 && i < brute._1.length) {
            val add = increment + brute._1(i)
            brute._1(i) = add % alphabetLen
            increment = add / alphabetLen
            i = i + 1
    }
    return (brute._1, increment == 0)
}

// Check if the brute is equal to the target string
def checkString(t: (Array[Int], Boolean), targetString: String): Boolean = {
    if (!t._2) return false
    for (i <- 0 to targetString.length) {
        if (targetString.charAt(i) != alphabet(t._1(i))) {
            return false
        }
    }
    return true
}

// Check all the strings between brute, and + length
def checkRange(t: (Brute, Int), alphabetLen: Int, targetString: String, alphabet: String): Boolean = {
    var brute = t._1
    var i = 0
    while (i < t._2 && brute._2) {
        if (checkString((brute._1, brute._2), targetString)) {
            return true
        }
        brute = bruteIncrement(brute, alphabetLen, 1)
        i = i + 1
    }
    return false
}

def search(targetString: String, alphabet: String, threads: Int, workPerRound: Int){
    val workSize = (workPerRound / threads).toInt
    val wordLen = targetString.length
    val alphabetLen = alphabet.length
    val BASIC_BRUTE = (Array.fill(wordLen)(0), false) // Value that looks like ([0], true) to fill up Arrays
    val TEMPLATE = (BASIC_BRUTE, workSize)

    // initialize templates ((string, overflow), range)

    var threadState = sc.parallelize(Array.fill(threads)(TEMPLATE))
    var threadResults = sc.parallelize(Array.fill(threads)(false))
    var roundState = (Array.fill(wordLen)(0), true)
    var iteration = 1

    while(true) {

        // start each thread state at start of its chunk 
        threadState = threadState.zipWithIndex().map{case(el, c) => {(bruteIncrement(el._1, alphabetLen, c * workSize), el._2)}}

        // for each thread, iterate through its chunksize checking for matches
        threadResults = threadState.map(el => checkRange(el, alphabetLen, targetString, alphabet))

        println("Checked " + iteration * threads * workSize + " strings")
        // reduce all thread results and see if any are true, if so, break
        if (threadResults.treeReduce(_ || _) == true) {
            println("FOUND")
            return
        }

        // Go to next chunk aka increment entire array by iteration, break if out of bounds
        roundState = bruteIncrement(roundState, alphabetLen, workSize * threads)
        threadState = sc.parallelize(Array.fill(threads)((roundState, workSize)))
        if (roundState._2 == false) {
            println("NOT FOUND")
            return
        }
        iteration += 1
    }
}

val targetString = "this7s"
val alphabet = "abcdefghijklmnopqrstuvwxyz"
spark.time(search(targetString, alphabet, 32, 1 << 24))
