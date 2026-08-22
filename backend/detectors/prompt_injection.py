def detect_prompt_injection(text):                    
    suspicious_patterns = [                   # s_c[] is It's a Python list. A list can contain multiple values. A list can contain multiple values:
        "ignore previous instructions",       # these all are list material  or lists component    
        "ignore all previous instructions",   
        "reveal system prompt", 

    ]                                           
    text = " ".join(text.lower().split())    #split vivides all the text into individual words and join add them togeather with a single space this solve sthe problem with multiple spaces 
    for pattern in suspicious_patterns:      # for loop will go through the list and check for the phrazes in the text      
        if pattern in text:                  # pattern in Text is case sensitive  to over come this we will convert all text to lower case 
            return True                      # suppose we call detect_prompt_injection("Hello Ceron") the function checks all the  list itens in suspicious patterns                               
    return False                             # if there is no presence of any list item it will return false if it will have it will return true
                                              #text= text.lower() [first version of code on line i.e text= ] # converts all text to lower case  also called normalization. but spaces will also cause problems this is solved by the next line  


