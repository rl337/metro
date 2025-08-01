# Metro Population Modeler

This project is a modern Python-based city population modeler. It allows you to generate and visualize city layouts based on population dynamics.

## Getting Started

1.  **Install dependencies:**
    ```bash
    poetry install
    ```

2.  **Generate a new city:**
    ```bash
    poetry run metro generate
    ```
    This will create a `city.json` file, which represents the initial state of your city.

## City History and Versioning

The `city.json` file is the single source of truth for your city's model. It contains all the parameters and data needed to reproduce the city's state.

To manage the history of your city, you should use a version control system like Git. By committing the `city.json` file, you can save snapshots of your city at different points in time.

### Example Workflow

1.  **Generate a new city:**
    ```bash
    poetry run metro generate --population 50000 --seed 1234
    ```

2.  **Save the initial state:**
    ```bash
    git add city.json
    git commit -m "Initial city generation with 50k population."
    ```

3.  **Make changes to the city (in the future):**
    ```bash
    # (Some future command that modifies the city)
    poetry run metro evolve --years 10
    ```

4.  **Save the new state:**
    ```bash
    git add city.json
    git commit -m "Evolve city by 10 years."
    ```

This workflow allows you to track the evolution of your city and easily revert to previous states if needed.

## Rendering the City

The `render` command will eventually produce an SVG map of the city.

```bash
poetry run metro render
```

Currently, this command is a placeholder and will only print information about the city. The SVG rendering functionality will be implemented in the future.
