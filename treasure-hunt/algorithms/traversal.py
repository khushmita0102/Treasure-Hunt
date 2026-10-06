# traversal.py - Manual BFS and DFS implementations
# No external graph/algorithm libraries used.

from collections import deque


def reconstruct_path(parent, start, target):
    """
    Walk back through the parent dict from target → start
    to reconstruct the traversal path.
    Returns a list of nodes from start to target.
    """
    path = []
    node = target
    while node is not None:
        path.append(node)
        node = parent.get(node)
    path.reverse()
    # Validate: path must begin at start
    if path and path[0] == start:
        return path
    return []


def bfs(graph, start, target):
    """
    Breadth First Search — explores nodes level by level.
    Data structure: Queue (FIFO)
    Guarantees shortest path in an unweighted graph.

    Returns a dict with:
      found         - bool
      path          - list of nodes forming the shortest route
      visited_order - order in which nodes were first discovered
      nodes_visited - count of nodes dequeued/explored
    """
    if start not in graph or target not in graph:
        return {"found": False, "path": [], "visited_order": [], "nodes_visited": 0}

    queue = deque([start])
    visited = {start}
    parent = {start: None}
    visited_order = []

    while queue:
        current = queue.popleft()
        visited_order.append(list(current))

        if current == target:
            path = reconstruct_path(parent, start, target)
            return {
                "found": True,
                "path": [list(n) for n in path],
                "visited_order": visited_order,
                "nodes_visited": len(visited_order),
            }

        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = current
                queue.append(neighbor)

    return {"found": False, "path": [], "visited_order": visited_order, "nodes_visited": len(visited_order)}


def dfs(graph, start, target):
    """
    Depth First Search — explores as deep as possible before backtracking.
    Data structure: Explicit stack (LIFO)
    Does NOT guarantee the shortest path.

    Returns a dict with:
      found         - bool
      path          - list of nodes forming the route found
      visited_order - order in which nodes were first discovered
      nodes_visited - count of nodes popped/explored
    """
    if start not in graph or target not in graph:
        return {"found": False, "path": [], "visited_order": [], "nodes_visited": 0}

    stack = [start]
    visited = set()
    parent = {start: None}
    visited_order = []

    while stack:
        current = stack.pop()

        if current in visited:
            continue
        visited.add(current)
        visited_order.append(list(current))

        if current == target:
            path = reconstruct_path(parent, start, target)
            return {
                "found": True,
                "path": [list(n) for n in path],
                "visited_order": visited_order,
                "nodes_visited": len(visited_order),
            }

        # Push neighbors onto stack (reverse order so first neighbor is explored first)
        for neighbor in reversed(graph[current]):
            if neighbor not in visited:
                if neighbor not in parent:
                    parent[neighbor] = current
                stack.append(neighbor)

    return {"found": False, "path": [], "visited_order": visited_order, "nodes_visited": len(visited_order)}
