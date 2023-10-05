from typing import List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameMove(BaseModel):
    seed: str
    moves: List[str]

def generate_board_from_seed(seed: str) -> List[List[int]]:
    gridRows, gridCols = 5, 5
    board = [[0 for _ in range(gridCols)] for _ in range(gridRows)]
    
    for i in range(gridRows):
        for j in range(gridCols):
            seedChar = seed[i * gridRows + j]
            board[i][j] = ord(seedChar) % 6  # Using Python's ord function to get Unicode value
            
    return board

def apply_moves_to_board(board, moves: List[str]):
    # Placeholder: Implement move application here.
    pass

def validate_and_score_board(board) -> (bool, int):
    # Placeholder: Implement board validation and scoring logic here.
    return True, 50

@app.get("/")
def read_root():
    return {"Why u": "pinging me?"}

@app.post("/verify-game/")
def verify_game(data: GameMove):
    try:
        board = generate_board_from_seed(data.seed)
        apply_moves_to_board(board, data.moves)
        is_valid, score = validate_and_score_board(board)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid game moves.")
        
        return {"score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error while verifying game.")
