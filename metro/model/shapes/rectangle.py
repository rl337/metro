"""
Rectangle class for Metro rendering system.
Represents a rectangular shape.
"""

from .shape import AbstractShape
from ..point2d import Point2D


class Rectangle(AbstractShape):
    """Represents a rectangular shape."""
    
    def __init__(self, located: Point2D, width: float, height: float):
        """Initialize rectangle with position and dimensions.
        
        Args:
            located: Upper-left corner position
            width: Width of the rectangle
            height: Height of the rectangle
        """
        super().__init__(located, width, height)
    
    def contains(self, point: Point2D) -> bool:
        """Check if a point is contained within the rectangle.
        
        Args:
            point: Point to check
            
        Returns:
            True if point is contained within the rectangle
        """
        return self.is_in_bound(point)
    
    def __str__(self) -> str:
        """String representation of rectangle.
        
        Returns:
            String representation
        """
        return f"Rectangle(at={self.get_upper_left()}, size={self.get_width()}x{self.get_height()})"
    
    def __repr__(self) -> str:
        """Detailed string representation.
        
        Returns:
            Detailed string representation
        """
        return f"Rectangle(located={self.get_upper_left()}, width={self.get_width()}, height={self.get_height()})"
