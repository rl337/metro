import typer
from metro.commands.generate import generate
from metro.commands.render import render

app = typer.Typer()

app.command()(generate)
app.command()(render)

if __name__ == "__main__":
    app()
