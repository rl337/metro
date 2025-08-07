import typer
from metro.commands.generate import generate
from metro.commands.render import render
from metro.commands.evolve import evolve

app = typer.Typer()

app.command()(generate)
app.command()(render)
app.command()(evolve)

if __name__ == "__main__":
    app()
