"""
Tests for Metro Point2D class.
"""

# import pytest
from metro.model.point2d import Point2D


class TestPoint2D:
    """Test cases for Point2D class."""

    def test_point_creation(self):
        """Test basic point creation."""
        point = Point2D(10.5, 20.3)
        assert point.x == 10.5
        assert point.y == 20.3

    def test_origin_constant(self):
        """Test ORIGIN constant."""
        assert Point2D.ORIGIN.x == 0
        assert Point2D.ORIGIN.y == 0

    def test_from_tuple(self):
        """Test creating point from tuple."""
        point = Point2D.from_tuple((10, 20))
        assert point.x == 10
        assert point.y == 20

    def test_translate(self):
        """Test point translation."""
        point = Point2D(10, 20)
        translated = point.translate(5, -3)
        assert translated.x == 15
        assert translated.y == 17
        assert point.x == 10  # Original should be unchanged
        assert point.y == 20

    def test_distance_to(self):
        """Test distance calculation."""
        point1 = Point2D(0, 0)
        point2 = Point2D(3, 4)
        distance = point1.distance_to(point2)
        assert abs(distance - 5.0) < 1e-9

    def test_to_tuple(self):
        """Test converting to tuple."""
        point = Point2D(10, 20)
        coords = point.to_tuple()
        assert coords == (10, 20)

    def test_addition(self):
        """Test point addition."""
        point1 = Point2D(10, 20)
        point2 = Point2D(5, 3)
        result = point1 + point2
        assert result.x == 15
        assert result.y == 23

        # Test with tuple
        result2 = point1 + (2, 1)
        assert result2.x == 12
        assert result2.y == 21

    def test_subtraction(self):
        """Test point subtraction."""
        point1 = Point2D(10, 20)
        point2 = Point2D(5, 3)
        result = point1 - point2
        assert result.x == 5
        assert result.y == 17

        # Test with tuple
        result2 = point1 - (2, 1)
        assert result2.x == 8
        assert result2.y == 19

    def test_multiplication(self):
        """Test point multiplication by scalar."""
        point = Point2D(10, 20)
        result = point * 2
        assert result.x == 20
        assert result.y == 40

        # Test right multiplication
        result2 = 3 * point
        assert result2.x == 30
        assert result2.y == 60

    def test_string_representation(self):
        """Test string representations."""
        point = Point2D(10.5, 20.3)
        assert str(point) == "(10.5, 20.3)"
        assert "Point2D(10.5, 20.3)" in repr(point)

    def test_equality(self):
        """Test point equality."""
        point1 = Point2D(10.5, 20.3)
        point2 = Point2D(10.5, 20.3)
        point3 = Point2D(10.6, 20.3)

        assert point1 == point2
        assert point1 != point3
        assert point1 != "not a point"

    def test_hash(self):
        """Test point hashing."""
        point1 = Point2D(10, 20)
        point2 = Point2D(10, 20)
        point3 = Point2D(10, 21)

        assert hash(point1) == hash(point2)
        assert hash(point1) != hash(point3)

        # Test that points can be used in sets
        point_set = {point1, point2, point3}
        assert len(point_set) == 2  # point1 and point2 are the same

    def test_type_conversion(self):
        """Test that coordinates are converted to float."""
        point = Point2D(10, 20)  # Integers should be converted to float
        assert isinstance(point.x, float)
        assert isinstance(point.y, float)
        assert point.x == 10.0
        assert point.y == 20.0
