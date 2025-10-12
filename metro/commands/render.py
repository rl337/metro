import typer

# import json
from metro.model import CityModel


def render(
    input_file: str = typer.Option(
        "city.json", help="The input file to read the city configuration from."
    ),
):
    """
    Renders a city model to an SVG file.
    """
    print(f"Rendering city from {input_file}.")

    with open(input_file, "r") as f:
        city_model = CityModel.model_validate_json(f.read())

    print(f"City population: {city_model.population}")
    print(f"Random seed: {city_model.seed}")

    # TODO: Implement SVG rendering logic here.
    print("SVG rendering is not yet implemented.")
