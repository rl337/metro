"""
Shape interface and AbstractShape class for Metro rendering system.
Provides base functionality for geometric shapes.
"""

from abc import ABC, abstractmethod

# from typing import List
from ..bounded import Bounded
from ..point2d import Point2D


class Shape(Bounded, ABC):
    """Abstract base class for geometric shapes."""

    @abstractmethod
    def contains(self, point: Point2D) -> bool:
        """Check if a point is contained within the shape.

        Args:
            point: Point to check

        Returns:
            True if point is contained within the shape
        """
        pass

    def contains_shape(self, shape: "Shape") -> bool:
        """Check if this shape contains another shape.

        Args:
            shape: Shape to check

        Returns:
            True if this shape contains the other shape
        """
        # Sample points within the other shape's bounding box
        position = shape.get_upper_left()
        width = shape.get_width()
        height = shape.get_height()

        # Sample at regular intervals
        step_x = max(1.0, width / 10)
        step_y = max(1.0, height / 10)

        for x in range(int(width / step_x) + 1):
            for y in range(int(height / step_y) + 1):
                candidate = Point2D(position.x + x * step_x, position.y + y * step_y)
                if shape.contains(candidate) and not self.contains(candidate):
                    return False

        return True


class AbstractShape(Shape):
    """Abstract base class for concrete shape implementations."""

    def __init__(self, located: Point2D, width: float, height: float):
        """Initialize shape with position and dimensions.

        Args:
            located: Upper-left corner position
            width: Width of the shape
            height: Height of the shape
        """
        from ..bounded import Bound

        self._bound = Bound(located, width, height)

    def get_width(self) -> float:
        """Get the width of the shape.

        Returns:
            Width of the shape
        """
        return self._bound.get_width()

    def get_height(self) -> float:
        """Get the height of the shape.

        Returns:
            Height of the shape
        """
        return self._bound.get_height()

    def is_in_bound(self, point: Point2D) -> bool:
        """Check if a point is within the shape's bounding box.

        Args:
            point: Point to check

        Returns:
            True if point is within bounds
        """
        return self._bound.is_in_bound(point)

    def get_upper_left(self) -> Point2D:
        """Get the upper-left corner of the shape.

        Returns:
            Upper-left corner point
        """
        return self._bound.get_upper_left()

    def get_lower_right(self) -> Point2D:
        """Get the lower-right corner of the shape.

        Returns:
            Lower-right corner point
        """
        return self._bound.get_lower_right()

    def get_center(self) -> Point2D:
        """Get the center of the shape.

        Returns:
            Center point
        """
        return self._bound.get_center()
