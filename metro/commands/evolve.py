import typer
import json
from metro.model import CityModel
from metro.rng import HierarchicalRNG
from metro.population import PopulationModel

def evolve(
    years: int = typer.Option(1, help="The number of years to simulate."),
    city_file: str = typer.Option("city.json", help="The city model file to evolve."),
):
    """
    Evolves the city model over a given number of years.
    """
    print(f"Evolving the city in {city_file} by {years} years.")

    # Load the city model from the file.
    with open(city_file, "r") as f:
        city_data = json.load(f)
        city_model = CityModel(**city_data)

    # Create a hierarchical RNG from the city's seed.
    # We get a child for the evolution process to not interfere with other
    # potential uses of the root RNG.
    rng = HierarchicalRNG(city_model.seed).get_child("evolution")

    # Create a population model from the city model.
    population_model = PopulationModel.from_city_model(city_model, rng)

    # --- Simulation Loop ---
    for i in range(years):
        city_model.current_year += 1
        year_rng = rng.get_child(f"year_{city_model.current_year}")

        print(f"Simulating year: {city_model.current_year}")

        # Run the simulation for one year.
        population_model.run_yearly_update(year_rng)
        population_model.update_occupations(year_rng)

    # --- End of Simulation Loop ---

    # Update the city model with the new population data.
    updated_data = population_model.to_city_model_data()
    for key, value in updated_data.items():
        setattr(city_model, key, value)

    # Save the updated city configuration to the file.
    with open(city_file, "w") as f:
        f.write(city_model.model_dump_json(indent=2))

    print(f"City model in {city_file} has been evolved to year {city_model.current_year}.")
