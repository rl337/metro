import typer
import json

def render(
    input_file: str = typer.Option("city.json", help="The input file to read the city configuration from."),
):
    """
    Renders a city model to an SVG file.
    """
    print(f"Rendering city from {input_file}.")

    with open(input_file, "r") as f:
        city_data = json.load(f)

    print(f"City population: {city_data['population']}")
    print(f"Random seed: {city_data['seed']}")

    # TODO: Implement SVG rendering logic here.
    print("SVG rendering is not yet implemented.")
