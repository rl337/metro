"""
Tests for Metro shape classes.
"""

# import pytest
from metro.model.point2d import Point2D
from metro.model.shapes.circle import Circle
from metro.model.shapes.rectangle import Rectangle
from metro.model.shapes.group import Group


class TestShapes:
    """Test cases for shape classes."""

    def test_rectangle(self):
        """Test rectangle shape functionality."""
        shape = Rectangle(Point2D.ORIGIN, 10, 10)

        # Test contains method
        assert shape.contains(Point2D(0, 0))
        assert shape.contains(Point2D(10, 10))

        assert not shape.contains(Point2D(10, 11))
        assert not shape.contains(Point2D(11, 10))
        assert not shape.contains(Point2D(0, -1))
        assert not shape.contains(Point2D(-1, 0))

    def test_circle(self):
        """Test circle shape functionality."""
        shape = Circle(Point2D.ORIGIN, 5)

        # Test contains method
        assert shape.contains(Point2D(0, 0))  # Center is included
        assert shape.contains(Point2D(4, 0))  # Inside circle
        assert shape.contains(Point2D(0, 4))  # Inside circle
        assert shape.contains(Point2D(5, 0))  # On edge (included)
        assert not shape.contains(Point2D(6, 0))  # Outside circle
        assert not shape.contains(Point2D(10, 10))  # Far outside

        assert not shape.contains(Point2D(10, 11))
        assert not shape.contains(Point2D(11, 10))
        assert not shape.contains(Point2D(0, -6))
        assert not shape.contains(Point2D(-6, 0))

    def test_composite(self):
        """Test composite shape (Group) functionality."""
        rectangle1 = Rectangle(Point2D.ORIGIN, 10, 10)
        rectangle2 = Rectangle(Point2D(100, 100), 10, 10)

        composite_shape = Group([rectangle1, rectangle2])

        # Test dimensions
        assert composite_shape.get_width() == 110
        assert composite_shape.get_height() == 110

        # Test contains method
        assert composite_shape.contains(Point2D(0, 0))
        assert composite_shape.contains(Point2D(10, 10))

        assert not composite_shape.contains(Point2D(10, 11))
        assert not composite_shape.contains(Point2D(11, 10))
        assert not composite_shape.contains(Point2D(0, -1))
        assert not composite_shape.contains(Point2D(-1, 0))

        assert composite_shape.contains(Point2D(100, 100))
        assert composite_shape.contains(Point2D(110, 110))

        assert not composite_shape.contains(Point2D(100 + 10, 100 + 11))
        assert not composite_shape.contains(Point2D(100 + 11, 100 + 10))
        assert not composite_shape.contains(Point2D(100, 100 - 1))
        assert not composite_shape.contains(Point2D(100 - 1, 100))

    def test_circle_center_and_radius(self):
        """Test circle center and radius properties."""
        center = Point2D(10, 20)
        radius = 15
        circle = Circle(center, radius)

        assert circle.get_center() == center
        assert circle.get_radius() == radius
        assert circle.get_width() == radius * 2
        assert circle.get_height() == radius * 2

    def test_rectangle_dimensions(self):
        """Test rectangle dimensions."""
        located = Point2D(5, 10)
        width = 20
        height = 30
        rectangle = Rectangle(located, width, height)

        assert rectangle.get_width() == width
        assert rectangle.get_height() == height
        assert rectangle.get_upper_left() == located
        assert rectangle.get_lower_right() == Point2D(
            located.x + width, located.y + height
        )

    def test_group_operations(self):
        """Test group operations."""
        rect1 = Rectangle(Point2D(0, 0), 10, 10)
        rect2 = Rectangle(Point2D(20, 20), 10, 10)

        group = Group([rect1])
        assert len(group.get_shapes()) == 1

        group.add_shape(rect2)
        assert len(group.get_shapes()) == 2
        assert rect2 in group.get_shapes()

    def test_empty_group(self):
        """Test empty group behavior."""
        group = Group([])
        assert len(group.get_shapes()) == 0
        assert group.get_width() == 0
        assert group.get_height() == 0
