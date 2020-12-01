import java.util.*; // For ArrayList
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

	static boolean any(ArrayList<Boolean> list){
		for(boolean e:list)if(e)return true;
		return false;
	}

	static boolean searchPart(String targetString, char [] alphabet, byte [] brute, int workSize, int workerId){
    		// Go to the start of my work
    		if(!bruteIncrement(brute, alphabet.length, workSize*workerId)){
        		return false;
		}
    		int count = 0;
    		while(true){
        		if(count>=workSize)break;
        		if(targetString.equals(bruteToString(brute, alphabet)))return true;
        		count +=1;
        		if(!bruteIncrement(brute, alphabet.length, 1))break;
		}
    		return false;
	}

	static boolean search(String targetString, String alphabetString, int numWorkers, int workSize){
		char [] alphabet=alphabetString.toCharArray();
		byte [] brute = new byte[targetString.length()]; 

		while(true){
        		ArrayList<Boolean> work = new ArrayList<Boolean>();
			for(int workerId=0;workerId<numWorkers;workerId++){
            			byte [] brutePart = brute.clone();
            			work.add(searchPart(targetString, alphabet, brutePart, workSize, workerId));
			}
			// System.out.println(work);
        		if(any(work))return true;

        		// advance to the next major chunk of work
        		if(!bruteIncrement(brute, alphabet.length, workSize*numWorkers)){
            			break;
			}
		}
		return false; 
	}

	public static void main(String [] args){
		String targetString = args[0];
    		String alphabetString = args[1];
    		int numWorkers = Integer.parseInt(args[2]);
    		int workSize = Integer.parseInt(args[3]);

		if(search(targetString, alphabetString, numWorkers, workSize)){
			System.out.println("found");
		} else {
			System.out.println("notfound");
		}
	}
}

