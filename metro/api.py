"""
Flask API for Metro City Generator

This module provides a REST API for the Metro city generation system,
allowing the web interface to request city simulations from the Python backend.
"""

from flask import Flask, request, jsonify, send_from_directory
import json
import os
from typing import Dict, Any

from .city_simulator import CitySimulator, simulate_city_from_config
from .seed_system import CitySeedManager


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Enable CORS for web interface
    @app.after_request
    def after_request(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type,Authorization"
        )
        response.headers.add(
            "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"
        )
        return response

    @app.route("/api/simulate-city", methods=["POST"])
    def simulate_city():
        """Simulate a city with the given parameters."""
        try:
            data = request.get_json()

            # Extract parameters
            population = data.get("population", 100000)
            city_size = data.get("citySize", 10.0)
            master_seed = data.get("masterSeed", 2944957927)

            # Create city configuration
            city_config = {
                "population": population,
                "seed": master_seed,
                "zones": {},  # Will be generated
                "workforce": {},  # Will be generated
                "occupations": {},  # Will be generated
                "histogram": [],  # Will be generated
            }

            # Simulate the city
            simulator = CitySimulator(city_config)
            city_layout = simulator.simulate_city(population, city_size)

            # Export city data
            city_data = simulator.export_city_data()

            return jsonify(city_data)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/city-config", methods=["GET"])
    def get_city_config():
        """Get the default city configuration."""
        try:
            config_path = os.path.join(os.path.dirname(__file__), "..", "city.json")
            with open(config_path, "r") as f:
                config = json.load(f)
            return jsonify(config)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/cities", methods=["GET"])
    def get_cities():
        """Get available city variations."""
        try:
            cities_path = os.path.join(
                os.path.dirname(__file__), "..", "docs", "cities.json"
            )
            if os.path.exists(cities_path):
                with open(cities_path, "r") as f:
                    cities = json.load(f)
                return jsonify(cities)
            else:
                return jsonify({})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/seed-tree/<int:master_seed>", methods=["GET"])
    def get_seed_tree(master_seed):
        """Get the seed tree for a given master seed."""
        try:
            seed_manager = CitySeedManager(master_seed)
            seed_tree = seed_manager.export_seed_tree()
            return jsonify(seed_tree)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "healthy", "service": "metro-city-api"})

    # Serve static files for development
    @app.route("/<path:filename>")
    def serve_static(filename):
        """Serve static files from the docs directory."""
        docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
        return send_from_directory(docs_dir, filename)

    @app.route("/")
    def serve_index():
        """Serve the main index.html file."""
        docs_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
        return send_from_directory(docs_dir, "index.html")

    return app


def run_dev_server(host="127.0.0.1", port=5000, debug=True):
    """Run the development server."""
    app = create_app()
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    run_dev_server()
