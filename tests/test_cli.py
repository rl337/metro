import json
from pathlib import Path
from typer.testing import CliRunner
from metro.main import app
from metro.model import CityModel

runner = CliRunner()

def test_generate_and_render(tmp_path: Path):
    """
    Tests the generate and render commands.
    """
    # 1. Run the generate command
    output_file = tmp_path / "city.json"
    result = runner.invoke(app, ["generate", "--output-file", str(output_file)])

    assert result.exit_code == 0
    assert output_file.exists()

    # 2. Verify the output file
    with open(output_file, "r") as f:
        city_data = json.load(f)

    assert "population" in city_data
    assert "seed" in city_data

    # Try to validate with the pydantic model
    CityModel.model_validate(city_data)

    # 3. Run the render command
    result = runner.invoke(app, ["render", "--input-file", str(output_file)])

    assert result.exit_code == 0
    assert "Rendering city from" in result.stdout
    assert "SVG rendering is not yet implemented" in result.stdout


def test_generate_is_deterministic(tmp_path: Path):
    """
    Tests that the generate command is deterministic.
    """
    # 1. Run the generate command
    output_file_1 = tmp_path / "city1.json"
    result_1 = runner.invoke(app, ["generate", "--output-file", str(output_file_1), "--seed", "123", "--population", "1000"])

    assert result_1.exit_code == 0
    assert output_file_1.exists()

    # 2. Run the generate command again
    output_file_2 = tmp_path / "city2.json"
    result_2 = runner.invoke(app, ["generate", "--output-file", str(output_file_2), "--seed", "123", "--population", "1000"])

    assert result_2.exit_code == 0
    assert output_file_2.exists()

    # 3. Verify the output files are identical
    with open(output_file_1, "r") as f1, open(output_file_2, "r") as f2:
        city_data_1 = json.load(f1)
        city_data_2 = json.load(f2)

    assert city_data_1 == city_data_2
