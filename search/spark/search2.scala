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

def toAlpha(a: Array[Int], alphabet: String): Array[Char] = {
    return a.map(c => alphabet(c))
}
def checkString(t: (Array[Char], Boolean), targetString: String): Boolean = {
    return t._2 == true && t._1.mkString("") == targetString
}

def checkRange(t: (Brute, Int), alphabetLen: Int): Boolean = {
    var brute = t._1
    var i = 0
    while (i < t._2 && brute._2) {
        val alpha = toAlpha(brute._1, alphabet)
        if (checkString(alpha, targetString)) {
            return true
        }
        brute = bruteIncrement(brute, alphabetLen, 1)
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

    // setup work for each thread eg. threadState(n) = [([0,0], true), ([0,1], true), ...([z,z], false)]
    // for (i <- threadState.indices){
    //     var chunkStart = bruteIncrement(roundState, alphabetLen, i * workSize)
    //     if (chunkStart._2 == true){
    //         // println("Thread " + i + " start at " + i * workSize)
    //         threadState(i) = sc.parallelize(Array.fill(workSize){BASIC_BRUTE}.zipWithIndex.map{case(_, c) => {bruteIncrement(chunkStart, alphabetLen, c)}})
    //     } else {
    //         // println("Thread " + i + " out of bounds")
    //         threadState(i) = sc.parallelize(Array.fill(workSize)((Array(0), false)))
    //     }
    // }
    while(true) {

        // start each thread state at start of its chunk 
        threadState = threadState.zipWithIndex().map{case(el, c) => {(bruteIncrement(el._1, alphabetLen, c * workSize), el._2)}}

        // for each thread, iterate through its chunksize checking for matches
        threadResults = threadState.map(el => checkRange(el, alphabetLen))

        // setup work for each thread eg. threadState(n) = [([0,0], true), ([0,1], true), ...([z,z], false)]
        // for (i <- threadState.indices){
        //     var chunkStart = bruteIncrement(roundState, alphabetLen, i * workSize)
        //     if (chunkStart._2 == true){
        //         // println("Thread " + i + " start at " + i * workSize)
        //         threadState(i) = threadState(i).zipWithIndex().map{case(_, c) => {bruteIncrement(chunkStart, alphabetLen, c)}}
        //     } else {
        //         // println("Thread " + i + " out of bounds")
        //         threadState(i) = sc.parallelize(Array(BASIC_BRUTE))
        //     }
        // }

        // for each thread, check if string matches, and save result
        // for (i <- threadState.indices){
        //     val matchedArr = threadState(i).map((t:Brute) => (toAlpha(t._1, alphabet), t._2)).map(t => checkString(t, targetString))
        //     threadResults(i) = matchedArr.reduce(_ || _) == true
        // }

        println("Checked " + iteration * threads * workSize + " strings")
        // reduce all thread results and see if any are true, if so, break
        if (threadResults.reduce(_ || _) == true) {
            println("FOUND")
            return
        }

        // // increase every thread state by workPerRound
        // for (i <- threadState.indices){
        //     threadState(i) = sc.parallelize(threadState(i).map((el:Brute) => bruteIncrement(el, alphabetLen, workSize * threads)))
        // }

        // Go to next chunk aka increment entire array by iteration, break if out of bounds
        roundState = bruteIncrement(roundState, alphabetLen, workSize * threads)
        if (roundState._2 == false) {
            println("NOT FOUND")
            return
        }
        iteration += 1
    }
}

val targetString = "this7"
val alphabet = "abcdefghijklmnopqrstuvwxyz"
spark.time(search(targetString, alphabet, 32, 1 << 22))
