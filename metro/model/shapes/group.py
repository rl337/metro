"""
Group class for Metro rendering system.
Represents a composite shape made up of multiple shapes.
"""

from typing import List
from .shape import Shape
from ..point2d import Point2D


class Group(Shape):
    """Represents a composite shape made up of multiple shapes."""

    def __init__(self, shapes: List[Shape]):
        """Initialize group with a list of shapes.

        Args:
            shapes: List of shapes to include in the group
        """
        self._shapes = shapes.copy()

        # Calculate bounding box that encompasses all shapes
        if not shapes:
            from ..bounded import Bound

            self._bound = Bound()
        else:
            from ..bounded import Bound

            self._bound = Bound()
            for shape in shapes:
                self._bound.include_bound(shape)

    def add_shape(self, shape: Shape) -> None:
        """Add a shape to the group.

        Args:
            shape: Shape to add
        """
        self._shapes.append(shape)
        self._bound.include_bound(shape)

    def get_shapes(self) -> List[Shape]:
        """Get the list of shapes in the group.

        Returns:
            List of shapes
        """
        return self._shapes.copy()

    def contains(self, point: Point2D) -> bool:
        """Check if a point is contained within any shape in the group.

        Args:
            point: Point to check

        Returns:
            True if point is contained within any shape in the group
        """
        return any(shape.contains(point) for shape in self._shapes)

    def get_width(self) -> float:
        """Get the width of the group's bounding box.

        Returns:
            Width of the bounding box
        """
        return self._bound.get_width()

    def get_height(self) -> float:
        """Get the height of the group's bounding box.

        Returns:
            Height of the bounding box
        """
        return self._bound.get_height()

    def is_in_bound(self, point: Point2D) -> bool:
        """Check if a point is within the group's bounding box.

        Args:
            point: Point to check

        Returns:
            True if point is within bounds
        """
        return self._bound.is_in_bound(point)

    def get_upper_left(self) -> Point2D:
        """Get the upper-left corner of the group's bounding box.

        Returns:
            Upper-left corner point
        """
        return self._bound.get_upper_left()

    def get_lower_right(self) -> Point2D:
        """Get the lower-right corner of the group's bounding box.

        Returns:
            Lower-right corner point
        """
        return self._bound.get_lower_right()

    def get_center(self) -> Point2D:
        """Get the center of the group's bounding box.

        Returns:
            Center point
        """
        return self._bound.get_center()

    def __str__(self) -> str:
        """String representation of group.

        Returns:
            String representation
        """
        return f"Group({len(self._shapes)} shapes)"

    def __repr__(self) -> str:
        """Detailed string representation.

        Returns:
            Detailed string representation
        """
        return f"Group(shapes={self._shapes})"
