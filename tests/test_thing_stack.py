"""
Tests for Metro ThingStack class.
"""

# import pytest
from metro.model.color import Color
from metro.model.point2d import Point2D
from metro.model.shapes.rectangle import Rectangle
from metro.model.things.simple_thing import SimpleThing
from metro.model.thing_stack import ThingStack


class TestThingStack:
    """Test cases for ThingStack class."""

    def get_thing_stack(self, shape, color, z):
        """Helper method to create a thing stack with a single thing."""
        return ThingStack([SimpleThing(shape, color, z)])

    def get_thing_stack_two(self, shape1, color1, z1, shape2, color2, z2):
        """Helper method to create a thing stack with two things."""
        return ThingStack(
            [SimpleThing(shape1, color1, z1), SimpleThing(shape2, color2, z2)]
        )

    def test_rectangle(self):
        """Test thing stack with rectangle."""
        shapes = self.get_thing_stack(Rectangle(Point2D.ORIGIN, 10, 10), Color.WHITE, 0)

        assert shapes.get(Point2D(0, 0)) == Color.WHITE
        assert shapes.get(Point2D(10, 10)) == Color.WHITE

        assert shapes.get(Point2D(10, 11)) == Color.EMPTY
        assert shapes.get(Point2D(11, 10)) == Color.EMPTY
        assert shapes.get(Point2D(0, -1)) == Color.EMPTY
        assert shapes.get(Point2D(-1, 0)) == Color.EMPTY

    def test_stack_z(self):
        """Test z-ordering in thing stack."""
        shapes = self.get_thing_stack_two(
            Rectangle(Point2D.ORIGIN, 10, 10),
            Color.WHITE,
            0,
            Rectangle(Point2D(5, 5), 10, 10),
            Color.RED,
            1,
        )

        assert shapes.get(Point2D(0, 0)) == Color.WHITE
        assert shapes.get(Point2D(6, 6)) == Color.RED
        assert shapes.get(Point2D(15, 15)) == Color.RED
        assert shapes.get(Point2D(-1, -1)) == Color.EMPTY
        assert shapes.get(Point2D(16, 16)) == Color.EMPTY

    def test_empty_stack(self):
        """Test empty thing stack."""
        stack = ThingStack([])
        assert len(stack.get_things()) == 0
        assert stack.get(Point2D(0, 0)) == Color.EMPTY

    def test_custom_default_color(self):
        """Test thing stack with custom default color."""
        stack = ThingStack([], Color.BLUE)
        assert stack.get(Point2D(0, 0)) == Color.BLUE

    def test_add_thing(self):
        """Test adding things to stack."""
        stack = ThingStack([])
        rect = Rectangle(Point2D(0, 0), 10, 10)
        thing = SimpleThing(rect, Color.RED, 0)

        stack.add_thing(thing)
        assert len(stack.get_things()) == 1
        assert stack.get(Point2D(5, 5)) == Color.RED

    def test_clear(self):
        """Test clearing thing stack."""
        rect = Rectangle(Point2D(0, 0), 10, 10)
        thing = SimpleThing(rect, Color.RED, 0)
        stack = ThingStack([thing])

        assert len(stack.get_things()) == 1
        stack.clear()
        assert len(stack.get_things()) == 0
        assert stack.get(Point2D(5, 5)) == Color.EMPTY

    def test_z_ordering(self):
        """Test that things are properly ordered by z-depth."""
        rect1 = Rectangle(Point2D(0, 0), 10, 10)
        rect2 = Rectangle(Point2D(5, 5), 10, 10)
        rect3 = Rectangle(Point2D(2, 2), 10, 10)

        thing1 = SimpleThing(rect1, Color.RED, 3)
        thing2 = SimpleThing(rect2, Color.GREEN, 1)
        thing3 = SimpleThing(rect3, Color.BLUE, 2)

        stack = ThingStack([thing1, thing2, thing3])
        things = stack.get_things()

        # Should be sorted by z-depth (ascending)
        assert things[0].get_z() == 1  # GREEN
        assert things[1].get_z() == 2  # BLUE
        assert things[2].get_z() == 3  # RED
