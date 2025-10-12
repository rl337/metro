"""
ThingStack class for Metro rendering system.
Manages collections of renderable objects with z-ordering.
"""

from typing import List
from .bounded import Bound
from .color import Color
from .point2d import Point2D
from .things.thing import Thing


class ThingStack(Bound):
    """Manages collections of renderable objects with z-ordering."""
    
    def __init__(self, things: List[Thing], default_color: Color = None):
        """Initialize thing stack with a list of things.
        
        Args:
            things: List of things to include in the stack
            default_color: Default color for empty areas, defaults to transparent
        """
        super().__init__()
        
        # Include all things in the bounding box
        for thing in things:
            self.include_bound(thing)
        
        # Sort things by z-depth (ascending order)
        self._ordered = sorted(things, key=lambda t: t.get_z())
        
        # Set default color
        if default_color is None:
            from .color import Color
            default_color = Color.EMPTY
        self._default_color = default_color
    
    def get(self, point: Point2D) -> Color:
        """Get the color at a specific point.
        
        Args:
            point: Point to sample
            
        Returns:
            Color at the point (from topmost thing or default)
        """
        # Check things in reverse order (top to bottom)
        for thing in reversed(self._ordered):
            if thing.contains(point):
                return thing.get_color()
        
        return self._default_color
    
    def add_thing(self, thing: Thing) -> None:
        """Add a thing to the stack.
        
        Args:
            thing: Thing to add
        """
        self.include_bound(thing)
        self._ordered.append(thing)
        self._ordered.sort(key=lambda t: t.get_z())
    
    def get_things(self) -> List[Thing]:
        """Get the list of things in the stack.
        
        Returns:
            List of things (sorted by z-depth)
        """
        return self._ordered.copy()
    
    def clear(self) -> None:
        """Clear all things from the stack."""
        self._ordered.clear()
        # Reset bounding box
        from .point2d import Point2D
        self.x1 = self.x2 = self.y1 = self.y2 = 0.0
    
    def __str__(self) -> str:
        """String representation of thing stack.
        
        Returns:
            String representation
        """
        return f"ThingStack({len(self._ordered)} things)"
    
    def __repr__(self) -> str:
        """Detailed string representation.
        
        Returns:
            Detailed string representation
        """
        return f"ThingStack(things={self._ordered}, default_color={self._default_color})"
