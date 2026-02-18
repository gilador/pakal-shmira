from typing import List
import json


class OptimReult:
    def __init__(self, result:List[int], isOptim):
        self.result = result
        self.isOptim = isOptim
        
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=4)
