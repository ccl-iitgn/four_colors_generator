# 🧠 Four Colors Puzzle Generator

This repository contains the **offline puzzle generator** for the [Four Colors Puzzle Game](https://github.com/ccl-iitgn/four_colors). It generates the **first `n` valid and unique map coloring puzzles**, each guaranteed to be solvable using the **Four Color Theorem** (no two adjacent regions share the same color, and at most 4 colors are used).
---

## 📂 Repository
- 🧩 Generator Code: [https://github.com/ccl-iitgn/four_colors_generator](https://github.com/ccl-iitgn/four_colors_generator)
- 🎮 Frontend UI: [https://github.com/ccl-iitgn/four_colors](https://github.com/ccl-iitgn/four_colors)

---

## 🧪 How to Run

```bash
# Clone the repository
git clone https://github.com/ccl-iitgn/four_colors_generator.git
cd four_colors_generator

# Install dependencies
pip install -r requirements.txt

# Generate the first n puzzles (e.g., 10 puzzles)
python generate_puzzles.py --n 10
