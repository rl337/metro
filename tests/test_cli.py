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
