import org.apache.spark._

type Brute = (Array[Int], Boolean);
def bruteIncrement(brute: Brute, alphabetLen: Int, incrementBy: Long): Brute = {
    var i = 0
    var increment = incrementBy.toInt
    while(increment > 0 && i < brute._1.length) {
            val add = increment + brute._1(i)
            brute._1(i) = add % alphabetLen
            increment = add / alphabetLen
            i = i + 1
    }
    return (brute._1, increment == 0)
}

def toAlpha(a: Array[Int]): Array[Char] = {
    return a.map(c => alphabet(c))
}
def checkString(t: (Array[Char], Boolean)): Str = {
    return t._2 == true && t._1.mkString("") == targetString
}

def search(targetString: Str, alphabet: Str, threads: Int, workSize: Int){
    val wordLen = targetString.length
    val alphabetLen = alphabet.length

    var enumsArr = Array.fill(workSize)((Array.fill(wordLen)(0), true))
    var resultArr = sc.parallelize(Array.fill(workSize)(false))
    // set offsets before loop
    //enumsArr = enumsArr.zipWithIndex().map{case (el: Brute, i: Long) => bruteIncrement(el, alphabetLen, i)}
    for (i <- enumsArr.indices) {
        enumsArr(i) = bruteIncrement(enumsArr(i), alphabetLen, i)
    }

    var iteration = 0
    val maxIterations = (math.pow(alphabetLen, wordLen) / workSize)
    while(iteration <= maxIterations ) {
        if (iteration % 25 == 0) println("ITERATION " + iteration)
        // check if match. enumsArr looks like contains tuples eg ([0,0,1], true)
        val p_enumsArr = sc.parallelize(enumsArr)
        var resultArr = p_enumsArr.map((t:Brute) => (toAlpha(t._1), t._2)).map(t => checkString(t, targetString))
        // reduce and see if true, if so break
        if (resultArr.reduce(_ || _) == true) {
            println("FOUND")
            return
        }
        // Go to next chunk aka increment entire array by iteration
        enumsArr = p_enumsArr.map((el: Brute) => bruteIncrement(el, alphabetLen, workSize)).collect()
        iteration = iteration + 1
    }
    println("NOT FOUND")
}

val targetString = "this7s"
val alphabet = "abcdefghijklmnopqrstuvwxyz"
search()
