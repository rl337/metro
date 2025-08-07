import typer
import random
import json
from metro.city import City
from metro.population import PopulationModel
from metro.model import CityModel, Workforce, Zone, Occupation, HistogramEntry
from metro.rng import HierarchicalRNG

def generate(
    population: int = typer.Option(100000, help="The population of the city."),
    seed: int = typer.Option(None, help="The random seed to use."),
    founding_year: int = typer.Option(1800, help="The founding year of the city."),
    output_file: str = typer.Option("city.json", help="The output file to save the city configuration."),
):
    """
    Generates a new city model.
    """
    if seed is None:
        seed = random.randint(0, 2**32 - 1)

    print(f"Generating a city with a population of {population}, a founding year of {founding_year}, and random seed {seed}.")

    # Create a random number generator with the given seed.
    rng = HierarchicalRNG(seed)

    # Create the population model.
    population_model = PopulationModel.generate_new(r=rng.get_child("population"), p=population)

    # Create the CityModel instance
    city_data = population_model.to_city_model_data()
    city_model = CityModel(
        seed=seed,
        founding_year=founding_year,
        current_year=founding_year,
        timeline=[],
        **city_data,
    )

    # Save the city configuration to a file.
    with open(output_file, "w") as f:
        f.write(city_model.model_dump_json(indent=2))

    print(f"City configuration saved to {output_file}.")
