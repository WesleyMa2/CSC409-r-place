import org.apache.spark._

val targetString = "abcde"
val alphabet = "abcdefghijklmnopqrstuvwxyz"

val wordLen = targetString.length
val alphabetLen = alphabet.length

val workSize = 1000

// Old solution
// val combsArr = sc.parallelize(List.fill(wordLen)(alphabet).flatten.combinations(wordLen).toList)
// val permsArr = combsArr.flatMap(_.permutations)
// val enumsStr = permsArr.map(comb => comb.mkString(""))
// val results = enumsStr.map(str => str == targetString)
// val resultsCollected = results.reduce(_ || _)

def bruteIncrement(brute: Array[Int], alphabetLen: Int, incrementBy: Long): Array[Int] = {
    var i = 0
    var increment = incrementBy.toInt
    while(increment > 0 && i < brute.length) {
            val add = increment + brute(i)
            brute(i) = add % alphabetLen
            increment = add / alphabetLen
            i = i + 1
    }
    // return increment == 0
    return brute
}



var iteration = 0
var enumsArr = sc.parallelize(Array.fill(workSize)(Array.fill(wordLen)(0)))
var resultArr = sc.parallelize(Array.fill(workSize)(false))



// set offsets before loop
enumsArr = enumsArr.zipWithIndex().map{case (el: Array[Int], i: Long) => bruteIncrement(el, alphabetLen, i)}

// loop forever
var iteration = 0
while(iteration < (math.pow(alphabetLen, wordLen) / workSize) ) {
    // if (enumsArr.reduce(_ == _) && enumsArr.first() == null) {
    //     println("NOT FOUND")
    //     System.exit(0)
    // }
    // check if match
    resultArr = enumsArr.map(el => (el.map(c => alphabet(c))).mkString("") == targetString)
    // reduce and see if true, if so break
    resultArr.collect()
    if (resultArr.reduce(_ || _) == true) {
        println("FOUND")
        sys.exit(0)
    }
    // Go to next chunk aka increment entire array by iteration * workSize
    enumsArr = enumsArr.map(el => bruteIncrement(el, alphabetLen, workSize))
    iteration = iteration + 1
}
println("NOT FOUND")

// val enumsStr = permsArr.map(comb => comb.mkString(""))
// val results = enumsStr.map(str => str == targetString)
// val resultsCollected = results.reduce(_ || _)

