"""
Bounded interface and Bound class for Metro rendering system.
Provides bounding box functionality for shapes and objects.
"""

from abc import ABC, abstractmethod

# from typing import List
from .point2d import Point2D


class Bounded(ABC):
    """Abstract base class for objects with bounding boxes."""

    @abstractmethod
    def get_width(self) -> float:
        """Get the width of the bounding box.

        Returns:
            Width of the bounding box
        """
        pass

    @abstractmethod
    def get_height(self) -> float:
        """Get the height of the bounding box.

        Returns:
            Height of the bounding box
        """
        pass

    @abstractmethod
    def is_in_bound(self, point: Point2D) -> bool:
        """Check if a point is within the bounding box.

        Args:
            point: Point to check

        Returns:
            True if point is within bounds
        """
        pass

    @abstractmethod
    def get_upper_left(self) -> Point2D:
        """Get the upper-left corner of the bounding box.

        Returns:
            Upper-left corner point
        """
        pass

    @abstractmethod
    def get_lower_right(self) -> Point2D:
        """Get the lower-right corner of the bounding box.

        Returns:
            Lower-right corner point
        """
        pass

    @abstractmethod
    def get_center(self) -> Point2D:
        """Get the center of the bounding box.

        Returns:
            Center point
        """
        pass


class Bound(Bounded):
    """Concrete implementation of Bounded interface."""

    def __init__(self, at: Point2D = None, width: float = 0.0, height: float = 0.0):
        """Initialize bounding box.

        Args:
            at: Upper-left corner position, defaults to origin
            width: Width of the bounding box
            height: Height of the bounding box
        """
        if at is None:
            at = Point2D.ORIGIN

        self.x1 = at.x
        self.x2 = at.x + width
        self.y1 = at.y
        self.y2 = at.y + height

    def include_point(self, point: Point2D) -> None:
        """Expand bounding box to include a point.

        Args:
            point: Point to include
        """
        if point.x < self.x1:
            self.x1 = point.x
        elif point.x > self.x2:
            self.x2 = point.x

        if point.y < self.y1:
            self.y1 = point.y
        elif point.y > self.y2:
            self.y2 = point.y

    def include_bound(self, other: Bounded) -> None:
        """Expand bounding box to include another bounded object.

        Args:
            other: Other bounded object to include
        """
        self.include_point(other.get_upper_left())
        self.include_point(other.get_lower_right())

    def get_width(self) -> float:
        """Get the width of the bounding box.

        Returns:
            Width of the bounding box
        """
        return self.x2 - self.x1

    def get_height(self) -> float:
        """Get the height of the bounding box.

        Returns:
            Height of the bounding box
        """
        return self.y2 - self.y1

    def is_in_bound(self, point: Point2D) -> bool:
        """Check if a point is within the bounding box.

        Args:
            point: Point to check

        Returns:
            True if point is within bounds
        """
        return self.x1 <= point.x <= self.x2 and self.y1 <= point.y <= self.y2

    def get_upper_left(self) -> Point2D:
        """Get the upper-left corner of the bounding box.

        Returns:
            Upper-left corner point
        """
        return Point2D(self.x1, self.y1)

    def get_lower_right(self) -> Point2D:
        """Get the lower-right corner of the bounding box.

        Returns:
            Lower-right corner point
        """
        return Point2D(self.x2, self.y2)

    def get_center(self) -> Point2D:
        """Get the center of the bounding box.

        Returns:
            Center point
        """
        return Point2D((self.x2 + self.x1) / 2, (self.y2 + self.y1) / 2)

    def __str__(self) -> str:
        """String representation of bounding box.

        Returns:
            String representation
        """
        return f"Bound({self.get_upper_left()} to {self.get_lower_right()})"

    def __repr__(self) -> str:
        """Detailed string representation.

        Returns:
            Detailed string representation
        """
        return f"Bound(at={self.get_upper_left()}, width={self.get_width()}, height={self.get_height()})"
