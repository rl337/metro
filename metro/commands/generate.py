import typer
import random
import json
from metro.city import City
from metro.population import PopulationModel
from metro.model import CityModel, Workforce, Zone, Occupation, HistogramEntry

def generate(
    population: int = typer.Option(100000, help="The population of the city."),
    seed: int = typer.Option(None, help="The random seed to use."),
    output_file: str = typer.Option("city.json", help="The output file to save the city configuration."),
):
    """
    Generates a new city model.
    """
    if seed is None:
        seed = random.randint(0, 2**32 - 1)

    print(f"Generating a city with a population of {population} and random seed {seed}.")

    # Create a random number generator with the given seed.
    rng = random.Random(seed)

    # Create the city and population models.
    city = City(p=population)
    population_model = PopulationModel(p=population, r=rng)

    # Create the CityModel instance
    city_model = CityModel(
        population=city.population,
        seed=seed,
        workforce=Workforce(**population_model.workforce()),
        zones={name: Zone(**data) for name, data in population_model.zones.items()},
        occupations={name: Occupation(**data) for name, data in population_model.occupations.items()},
        histogram=[HistogramEntry(**entry) for entry in population_model.histogram],
    )

    # Save the city configuration to a file.
    with open(output_file, "w") as f:
        f.write(city_model.model_dump_json(indent=2))

    print(f"City configuration saved to {output_file}.")
