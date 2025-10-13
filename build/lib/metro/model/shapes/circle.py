"""
Circle class for Metro rendering system.
Represents a circular shape.
"""

import math
from .shape import AbstractShape
from ..point2d import Point2D


class Circle(AbstractShape):
    """Represents a circular shape."""

    def __init__(self, center: Point2D, radius: float):
        """Initialize circle with center and radius.

        Args:
            center: Center point of the circle
            radius: Radius of the circle
        """
        # Calculate bounding box for the circle
        located = Point2D(center.x - radius, center.y - radius)
        diameter = radius * 2
        super().__init__(located, diameter, diameter)
        self._center = center
        self._radius = radius

    def get_radius(self) -> float:
        """Get the radius of the circle.

        Returns:
            Radius of the circle
        """
        return self._radius

    def get_center(self) -> Point2D:
        """Get the center of the circle.

        Returns:
            Center point of the circle
        """
        return self._center

    def contains(self, point: Point2D) -> bool:
        """Check if a point is contained within the circle.

        Args:
            point: Point to check

        Returns:
            True if point is contained within the circle
        """
        # Calculate distance from point to center
        dx = point.x - self._center.x
        dy = point.y - self._center.y
        distance = math.sqrt(dx * dx + dy * dy)

        return distance <= self._radius

    def __str__(self) -> str:
        """String representation of circle.

        Returns:
            String representation
        """
        return f"Circle(center={self._center}, radius={self._radius})"

    def __repr__(self) -> str:
        """Detailed string representation.

        Returns:
            Detailed string representation
        """
        return f"Circle(center={self._center}, radius={self._radius})"
