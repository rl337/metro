#!/usr/bin/env python3
"""
Run the Metro City Generator web application.

This script starts the Flask development server for the Metro web interface.
"""

import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from metro.api import run_dev_server

if __name__ == '__main__':
    print("🏙️  Starting Metro City Generator Web App...")
    print("📍 Server will be available at: http://127.0.0.1:5000")
    print("🛑 Press Ctrl+C to stop the server")
    print()
    
    try:
        run_dev_server(host='127.0.0.1', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)
