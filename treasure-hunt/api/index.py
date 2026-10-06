import sys
import os

# Make sure the project root is on the path when running as a Vercel function
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app  # noqa: E402 – import after path fix
