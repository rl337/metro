"""
Point2D class for Metro rendering system.
Represents a 2D point with x and y coordinates.
"""

from typing import Union


class Point2D:
    """Represents a 2D point with x and y coordinates."""

    # Class constant for origin
    ORIGIN = None  # Will be set after class definition

    def __init__(self, x: float, y: float):
        """Initialize point with x and y coordinates.

        Args:
            x: X coordinate
            y: Y coordinate
        """
        self.x = float(x)
        self.y = float(y)

    @classmethod
    def from_tuple(cls, coords: tuple) -> "Point2D":
        """Create point from tuple.

        Args:
            coords: Tuple of (x, y) coordinates

        Returns:
            Point2D instance
        """
        return cls(coords[0], coords[1])

    def translate(self, dx: float, dy: float) -> "Point2D":
        """Create a new point translated by dx, dy.

        Args:
            dx: X translation
            dy: Y translation

        Returns:
            New translated Point2D
        """
        return Point2D(self.x + dx, self.y + dy)

    def distance_to(self, other: "Point2D") -> float:
        """Calculate distance to another point.

        Args:
            other: Other point

        Returns:
            Distance between points
        """
        import math

        return math.sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)

    def to_tuple(self) -> tuple:
        """Convert to tuple.

        Returns:
            Tuple of (x, y) coordinates
        """
        return (self.x, self.y)

    def __add__(self, other: Union["Point2D", tuple]) -> "Point2D":
        """Add another point or tuple to this point.

        Args:
            other: Point2D or tuple to add

        Returns:
            New Point2D with added coordinates
        """
        if isinstance(other, Point2D):
            return Point2D(self.x + other.x, self.y + other.y)
        elif isinstance(other, (tuple, list)) and len(other) >= 2:
            return Point2D(self.x + other[0], self.y + other[1])
        else:
            raise TypeError(f"Cannot add {type(other)} to Point2D")

    def __sub__(self, other: Union["Point2D", tuple]) -> "Point2D":
        """Subtract another point or tuple from this point.

        Args:
            other: Point2D or tuple to subtract

        Returns:
            New Point2D with subtracted coordinates
        """
        if isinstance(other, Point2D):
            return Point2D(self.x - other.x, self.y - other.y)
        elif isinstance(other, (tuple, list)) and len(other) >= 2:
            return Point2D(self.x - other[0], self.y - other[1])
        else:
            raise TypeError(f"Cannot subtract {type(other)} from Point2D")

    def __mul__(self, scalar: float) -> "Point2D":
        """Multiply point by scalar.

        Args:
            scalar: Scalar value

        Returns:
            New Point2D with scaled coordinates
        """
        return Point2D(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Point2D":
        """Right multiply point by scalar.

        Args:
            scalar: Scalar value

        Returns:
            New Point2D with scaled coordinates
        """
        return self.__mul__(scalar)

    def __str__(self) -> str:
        """String representation of point.

        Returns:
            String in format '(x, y)'
        """
        return f"({self.x}, {self.y})"

    def __repr__(self) -> str:
        """Detailed string representation.

        Returns:
            Detailed string representation
        """
        return f"Point2D({self.x}, {self.y})"

    def __eq__(self, other) -> bool:
        """Check equality with another point.

        Args:
            other: Other point to compare

        Returns:
            True if points are equal
        """
        if not isinstance(other, Point2D):
            return False
        return abs(self.x - other.x) < 1e-9 and abs(self.y - other.y) < 1e-9

    def __hash__(self) -> int:
        """Hash for use in sets and dictionaries.

        Returns:
            Hash value
        """
        return hash((self.x, self.y))


# Set the ORIGIN constant after class definition
Point2D.ORIGIN = Point2D(0, 0)
