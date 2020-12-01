public class Search {

	static boolean bruteIncrement(byte [] brute, int alphabetLen, int incrementBy){
        	int i = 0;
        	while(incrementBy > 0 && i < brute.length) {
                	int add = incrementBy + brute[i];
                	brute[i] = (byte) (add % alphabetLen);
                	incrementBy = add / alphabetLen;
                	i++;
        	}
        	return incrementBy == 0;
	}

	static String bruteToString(byte [] brute, char [] alphabet){
		String s="";
		for(byte c:brute){
			s+=alphabet[c];
		}
		return s;
	}

	static boolean search(String targetString, String alphabetString){
		byte [] brute = new byte[targetString.length()]; 
		char [] alphabet=alphabetString.toCharArray();
		boolean isDone=false;
		do {
			if(targetString.equals(bruteToString(brute, alphabet))){
				return true;
			}
		} while(bruteIncrement(brute, alphabet.length, 1));
		return false;
	}

	public static void main(String [] args){
		// targetString alphabet
		if(search(args[0], args[1])){
			System.out.println("found");
		} else {
			System.out.println("notfound");
		}
	}
}
