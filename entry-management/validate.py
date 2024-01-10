import numpy as np
import sys
from PIL import Image
import requests
from io import BytesIO
import os

# Constants
GRID_ROWS = 5
GRID_COLS = 5
CANDY_IMAGES_COUNT = 7  # Number of different candies
SPECIAL_CANDY_INDEX = CANDY_IMAGES_COUNT - 1  # Assuming the last candy is special

candy_images = [
"backpack.png",
"bonk.png",
"jules.png",
"nyla.png",
"otter.png",
"tetsu.png",
"sticker_size.gif"
];

def generate_board_from_seed(seed):
    board = np.zeros((GRID_ROWS, GRID_COLS), dtype=int)
    for i in range(GRID_ROWS):
        for j in range(GRID_COLS):
            seed_char = seed[i * GRID_ROWS + j]
            board[j, i] = ord(seed_char) % 6
    return board

def print_board(board):
    for row in board:
        print(" ".join(str(cell) for cell in row))
    print()

def apply_move(board, move):
    direction = move[-1]
    col = int(move[1]) - 1
    row = ord(move[0]) - ord('a')
    #print(row,col,direction)

    if direction in ['n', 's']:
        col_adjacent = col + 1 if direction == 's' else col - 1
        board[row, col], board[row, col_adjacent] = board[row, col_adjacent], board[row, col]
    else:
        row_adjacent = row + 1 if direction == 'r' else row - 1
        board[row, col], board[row_adjacent, col] = board[row_adjacent, col], board[row, col]

def get_replacement_indices(matched_index, total_matches, candy_images_length):
    if matched_index == SPECIAL_CANDY_INDEX:  # Special card
        if total_matches % 2 == 0:  # Even
            return [2, 1, 0]
        else:  # Odd
            return [5, 4, 3]
    else:
        if total_matches == 4:
            # For a match of length 4, include two special cards in the middle
            previous_index = matched_index - 1 if matched_index - 1 >= 0 else candy_images_length - 2
            next_index = (matched_index + 1) % (candy_images_length - 1)
            return [previous_index, SPECIAL_CANDY_INDEX, SPECIAL_CANDY_INDEX, next_index]
        elif total_matches == 5:
            # For a match of length 5, include two special cards in the middle
            previous_index = matched_index - 1 if matched_index - 1 >= 0 else candy_images_length - 2
            next_index = (matched_index + 1) % (candy_images_length - 1)
            return [previous_index, SPECIAL_CANDY_INDEX, SPECIAL_CANDY_INDEX, SPECIAL_CANDY_INDEX, next_index]
        else:
            previous_index = matched_index - 1 if matched_index - 1 >= 0 else candy_images_length - 2
            next_index = (matched_index + 1) % (candy_images_length - 1)
            return [previous_index, SPECIAL_CANDY_INDEX, next_index]

def detect_and_replace_matches(board):
    matches = 0
    card_matches = 0

    # Function to handle the replacement of candies in a match
    def replace_candies(start_row, start_col, length, is_horizontal):
        nonlocal matches, card_matches
        candy_type = board[start_row, start_col]
        if candy_type == SPECIAL_CANDY_INDEX:
            card_matches += length
        matches += length
        indices = get_replacement_indices(candy_type, length, CANDY_IMAGES_COUNT)
        for i in range(length):
            if is_horizontal:
                board[start_row, start_col + i] = indices[i % 3]
            else:
                board[start_row + i, start_col] = indices[i % 3]

    # Check for horizontal matches
    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            length = 1
            while col + length < GRID_COLS and board[row, col] == board[row, col + length]:
                length += 1
            if length >= 3:
                replace_candies(row, col, length, True)
                col += length - 1  # Skip the matched candies

    # Check for vertical matches
    for col in range(GRID_COLS):
        for row in range(GRID_ROWS):
            length = 1
            while row + length < GRID_ROWS and board[row, col] == board[row + length, col]:
                length += 1
            if length >= 3:
                replace_candies(row, col, length, False)
                row += length - 1  # Skip the matched candies

    return matches, card_matches

# Function to save the board as an image
def save_board_as_image(board, turn_number, folder="game_turns"):
    os.makedirs(folder, exist_ok=True)  # Create folder if it doesn't exist
    image_size = 64  # Size of each candy image

    # Create a new blank image
    board_image = Image.new('RGB', (GRID_COLS * image_size, GRID_ROWS * image_size))

    for i in range(GRID_ROWS):
        for j in range(GRID_COLS):
            img_file = candy_images[board[i, j]]
            img = Image.open(img_file).resize((image_size, image_size))
            board_image.paste(img, (j * image_size, i * image_size))

    # Save the image
    board_image.save(f"{folder}/turn_{turn_number}.png")

# Modify your existing print_board function or wherever you want to display the board
def print_board(board, turn_number):
    save_board_as_image(board, turn_number)

def calculate_score(seed, moves_string):
    board = generate_board_from_seed(seed)
    #print("Initial Board:")
    print_board(board, 0)  # Pass 0 as the initial turn number

    total_points = 0
    total_cards_collected = 0
    moves = moves_string.split('|')

    for turn_number, move in enumerate(moves, start=1):
        apply_move(board, move)
        #print(f"After move {move}:")
        print_board(board, turn_number)  # Pass turn_number for each move

        points, cards_collected = detect_and_replace_matches(board)
        total_points += points
        total_cards_collected += cards_collected

        points, cards_collected = detect_and_replace_matches(board)
        total_points += points
        total_cards_collected += cards_collected

        #print(f"Points after this move: {points}, Total Points: {total_points}")
        #print(f"Cards Collected after this move: {cards_collected}, Total Cards Collected: {total_cards_collected}")
        #print()

    #print("Final Board:")
    print_board(board, len(moves) + 1)  # Pass the final turn number
    return total_points, total_cards_collected


# Check if the script is run directly (not imported as a module)
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 validate.py <moves_string>")
        sys.exit(1)

    moves_string = sys.argv[1]
    seed = "2cN982Bz3FTMGJdYrN91RFsHs4erJQTgQ63if4mYaawLzzwVmjgtcDpBo7gs4Vf8TBk81PH15qXrStJVgFmTmtbc"
    
    points, cards_collected = calculate_score(seed, moves_string)
    # Print the results in a single line, separated by a colon
    print(f"Points:{points},CardsCollected:{cards_collected}")