"""
SimpleThing class for Metro rendering system.
A concrete implementation of Thing that wraps a shape with color and depth.
"""

from ..color import Color
from ..shapes.shape import Shape
from .thing import Thing


class SimpleThing(Thing):
    """A simple renderable object that wraps a shape with color and depth."""
    
    def __init__(self, shape: Shape, color: Color, z: float):
        """Initialize simple thing with shape, color, and depth.
        
        Args:
            shape: The underlying shape
            color: Color of the thing
            z: Z-depth value
        """
        self._shape = shape
        self._color = color
        self._z = z
    
    def get_color(self) -> Color:
        """Get the color of the thing.
        
        Returns:
            Color of the thing
        """
        return self._color
    
    def get_z(self) -> float:
        """Get the z-depth of the thing.
        
        Returns:
            Z-depth value
        """
        return self._z
    
    def contains(self, point):
        """Check if a point is contained within the thing's shape.
        
        Args:
            point: Point to check
            
        Returns:
            True if point is contained within the shape
        """
        return self._shape.contains(point)
    
    def contains_shape(self, shape: Shape) -> bool:
        """Check if this thing's shape contains another shape.
        
        Args:
            shape: Shape to check
            
        Returns:
            True if this thing's shape contains the other shape
        """
        return self._shape.contains_shape(shape)
    
    def get_width(self) -> float:
        """Get the width of the thing's shape.
        
        Returns:
            Width of the shape
        """
        return self._shape.get_width()
    
    def get_height(self) -> float:
        """Get the height of the thing's shape.
        
        Returns:
            Height of the shape
        """
        return self._shape.get_height()
    
    def is_in_bound(self, point):
        """Check if a point is within the thing's shape bounds.
        
        Args:
            point: Point to check
            
        Returns:
            True if point is within bounds
        """
        return self._shape.is_in_bound(point)
    
    def get_upper_left(self):
        """Get the upper-left corner of the thing's shape.
        
        Returns:
            Upper-left corner point
        """
        return self._shape.get_upper_left()
    
    def get_lower_right(self):
        """Get the lower-right corner of the thing's shape.
        
        Returns:
            Lower-right corner point
        """
        return self._shape.get_lower_right()
    
    def get_center(self):
        """Get the center of the thing's shape.
        
        Returns:
            Center point
        """
        return self._shape.get_center()
    
    def __str__(self) -> str:
        """String representation of simple thing.
        
        Returns:
            String representation
        """
        return f"SimpleThing(shape={self._shape}, color={self._color}, z={self._z})"
    
    def __repr__(self) -> str:
        """Detailed string representation.
        
        Returns:
            Detailed string representation
        """
        return f"SimpleThing(shape={self._shape}, color={self._color}, z={self._z})"
