# Agent Instructions

This document provides guidance for AI agents working on this repository.

## Project Vision

The goal of this project is to create a modern and extensible city population modeler. The tool should be easy to use from the command line and provide a clear and versionable way to manage city models.

## Architectural Principles

- **Object-Oriented Design:** The codebase should follow object-oriented principles. Core concepts should be represented by classes.
- **Single Entry Point:** The project has a single entry point for the command-line interface, located in `metro/main.py`.
- **Command Design Pattern:** Subcommands should be implemented following a command design pattern. Each command should be a self-contained unit in the `metro/commands` directory.
- **Strict Typing:** All code should use rigorous type hinting. The use of `typing.Any` should be avoided. If you encounter a situation where `Any` seems necessary, you should refactor the code to introduce a new, strictly-typed object.
- **Pydantic Models:** The `CityModel` and its sub-models are defined using Pydantic. This is the source of truth for the city's data structure. All data exchange should be done through these models.

## Development Workflow

- **Tests:** All new features should be accompanied by tests. Tests are located in the `tests/` directory and are run using `pytest`.
- **Docstrings:** All modules, classes, and functions should have clear and concise docstrings that explain their purpose, arguments, and return values.
- **GitHub Actions:** The project uses GitHub Actions for continuous integration. All tests must pass before a change is merged.

## Future Plans

- **SVG Rendering:** The `render` command will be extended to generate SVG maps of the city.
- **City Evolution:** New commands will be added to evolve the city over time (e.g., simulating population growth, construction, etc.).
- **GitHub Pages:** The project will eventually generate a GitHub Pages site to showcase a default city model. This will be orchestrated through a shell script that runs the CLI commands in sequence.
