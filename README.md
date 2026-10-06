# Treasure Hunt – Graph Traversal Algorithms

A DAA mini project that visualises **BFS** and **DFS** on a 6×6 grid map.

## Tech Stack
- Backend: Python 3 + Flask (REST API)
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Deployment: Vercel

## Local Development

```bash
# 1. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
python main.py
```

Open http://127.0.0.1:5000 in your browser.

## Project Structure

```
treasure-hunt/
├── api/
│   └── index.py          # Vercel serverless entry-point
├── algorithms/
│   ├── __init__.py
│   ├── graph.py          # Grid → adjacency-list graph builder
│   └── traversal.py      # Manual BFS & DFS implementations
├── static/
│   ├── style.css
│   └── script.js
├── templates/
│   └── index.html
├── main.py               # Flask app + API routes
├── requirements.txt
├── vercel.json
└── .gitignore
```


## API Endpoints

| Method | Endpoint   | Description                        |
|--------|------------|------------------------------------|
| GET    | `/`        | Serves the web UI                  |
| GET    | `/api/grid`| Returns the grid, start, target    |
| POST   | `/api/bfs` | Runs BFS, returns traversal result |
| POST   | `/api/dfs` | Runs DFS, returns traversal result |

## Graph Model

- **Vertex** – every walkable cell `(row, col)`
- **Edge** – valid movement between two adjacent walkable cells (up / down / left / right, no diagonals)
- **Graph type** – unweighted, undirected adjacency list (`dict`)

BFS guarantees the shortest path. DFS does not.
