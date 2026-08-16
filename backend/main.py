from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI() # We're creating a FastAPI application object.



class AnalysisRequest(BaseModel):            # BaseModel:- Create my AnalysisRequest model based on Pydantic's BaseModel
    text: str                                #BaseModel is a class provided by Pydantic.We're going to inherit from it to create our own data model.
                                             #AnalysisRequest;- It's simply the name we've chosen.

@app.get("/") # means:- "When the application receives a GET request for /, use the function immediately below this line."#
async def root():                                  # root is simply the name of the function we can use other name and itll stil work, 
     return {"name":"ceron","status":"online"}     # def root(): This creates a Python function 
                                                   #async tells Python:"This function can operate asynchronously."
               

@app.get("/api/v1/health")
async def health_check():                        # performs health check up ou api/url/web
     return{"status":"healthy"} 


@app.post("/api/v1/analyze")  
async def analyze(request: AnalysisRequest):
    return {
        "text": request.text,
        "status": "received"
    }



 
                                          