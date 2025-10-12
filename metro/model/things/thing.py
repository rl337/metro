"""
Thing interface for Metro rendering system.
Represents renderable objects with color and depth.
"""

from abc import ABC, abstractmethod
from ..color import Color
from ..shapes.shape import Shape


class Thing(Shape, ABC):
    """Abstract base class for renderable objects."""
    
    @abstractmethod
    def get_color(self) -> Color:
        """Get the color of the thing.
        
        Returns:
            Color of the thing
        """
        pass
    
    @abstractmethod
    def get_z(self) -> float:
        """Get the z-depth of the thing.
        
        Returns:
            Z-depth value
        """
        pass
