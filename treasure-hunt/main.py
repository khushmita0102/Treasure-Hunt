from flask import Flask, jsonify, render_template, request
from algorithms.graph import build_graph, get_grid
from algorithms.traversal import bfs, dfs

app = Flask(__name__, template_folder='templates', static_folder='static')


def _grid_payload():
    """Return serialisable grid + metadata."""
    grid, start, target = get_grid()
    return grid, list(start), list(target)


@app.route('/')
def index():
    grid, start, target = _grid_payload()
    return render_template('index.html', grid=grid, start=start, target=target)


@app.route('/api/grid')
def api_grid():
    grid, start, target = _grid_payload()
    return jsonify({"grid": grid, "start": start, "target": target})


@app.route('/api/bfs', methods=['POST'])
def api_bfs():
    grid, start, target = get_grid()
    graph = build_graph(grid)
    result = bfs(graph, start, target)
    return jsonify({
        "algorithm": "BFS",
        "found": result["found"],
        "visited_order": result["visited_order"],
        "path": result["path"],
        "nodes_visited": result["nodes_visited"],
        "path_length": len(result["path"]),
    })


@app.route('/api/dfs', methods=['POST'])
def api_dfs():
    grid, start, target = get_grid()
    graph = build_graph(grid)
    result = dfs(graph, start, target)
    return jsonify({
        "algorithm": "DFS",
        "found": result["found"],
        "visited_order": result["visited_order"],
        "path": result["path"],
        "nodes_visited": result["nodes_visited"],
        "path_length": len(result["path"]),
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


if __name__ == '__main__':
    app.run(debug=True)
