# graph.py - Builds adjacency list from the grid
# Vertex = walkable cell (row, col)
# Edge   = valid movement between two adjacent walkable cells (up/down/left/right)

GRID = [
    ['S', '.', '.', '#', '.', '.'],
    ['#', '.', '.', '#', '.', '.'],
    ['.', '.', '#', '.', '.', '.'],
    ['.', '#', '#', '.', '#', '.'],
    ['.', '.', '.', '.', '.', '.'],
    ['#', '.', '.', '#', '.', 'T'],
]

ROWS = len(GRID)
COLS = len(GRID[0])


def find_positions(grid):
    """Return the (row, col) of S and T."""
    start = target = None
    for r in range(len(grid)):
        for c in range(len(grid[r])):
            if grid[r][c] == 'S':
                start = (r, c)
            elif grid[r][c] == 'T':
                target = (r, c)
    return start, target


def build_graph(grid):
    """
    Build an adjacency-list graph from the grid.
    Only walkable cells ('.', 'S', 'T') become vertices.
    Edges connect horizontally or vertically adjacent walkable cells.
    Returns a dict: { (r, c): [(r2, c2), ...], ... }
    """
    graph = {}
    rows = len(grid)
    cols = len(grid[0])
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # up, down, left, right

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '#':
                continue  # walls are not vertices
            node = (r, c)
            graph[node] = []
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != '#':
                    graph[node].append((nr, nc))

    return graph


def get_grid():
    """Return the fixed grid, start position, and target position."""
    start, target = find_positions(GRID)
    return GRID, start, target
