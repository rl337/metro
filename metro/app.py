"""
Main application for Metro rendering system.
Demonstrates the rendering capabilities with sample shapes.
"""

from typing import List
from .model.color import Color
from .model.point2d import Point2D
from .model.thing_stack import ThingStack
from .model.shapes.circle import Circle
from .model.things.simple_thing import SimpleThing
from .renderer import Renderer


def create_sample_scene() -> ThingStack:
    """Create a sample scene with various shapes.

    Returns:
        ThingStack containing sample shapes
    """
    things: List[SimpleThing] = []

    # Create a grid of circles
    for x in range(4):
        for y in range(4):
            center = Point2D(10 + 100 * x, 10 + 100 * y)
            circle = Circle(center, 5)
            thing = SimpleThing(circle, Color.WHITE, 0)
            things.append(thing)

    return ThingStack(things, Color.BLACK)


def main():
    """Main application entry point."""
    print("Metro Rendering System")
    print("=====================")

    # Create renderer
    renderer = Renderer(1024, 768)

    # Create sample scene
    print("Creating sample scene...")
    thing_stack = create_sample_scene()

    # Render the scene
    print("Rendering scene...")
    renderer.render(thing_stack)

    # Display the result
    print("Displaying result...")
    renderer.show()

    print("Done!")


if __name__ == "__main__":
    main()
