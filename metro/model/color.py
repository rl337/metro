"""
Color class for Metro rendering system.
Provides RGBA color representation with conversion utilities.
"""

from typing import Tuple


class Color:
    """Represents a color with RGBA components (0.0-1.0 range)."""
    
    def __init__(self, red: float, green: float, blue: float, alpha: float = 1.0):
        """Initialize color with RGBA components.
        
        Args:
            red: Red component (0.0-1.0)
            green: Green component (0.0-1.0)
            blue: Blue component (0.0-1.0)
            alpha: Alpha component (0.0-1.0), defaults to 1.0
        """
        self.r = max(0.0, min(1.0, red))
        self.g = max(0.0, min(1.0, green))
        self.b = max(0.0, min(1.0, blue))
        self.a = max(0.0, min(1.0, alpha))
    
    @classmethod
    def from_rgb(cls, red: int, green: int, blue: int, alpha: int = 255) -> 'Color':
        """Create color from RGB values (0-255 range).
        
        Args:
            red: Red component (0-255)
            green: Green component (0-255)
            blue: Blue component (0-255)
            alpha: Alpha component (0-255), defaults to 255
            
        Returns:
            Color instance
        """
        return cls(red / 255.0, green / 255.0, blue / 255.0, alpha / 255.0)
    
    @classmethod
    def from_hex(cls, hex_color: str) -> 'Color':
        """Create color from hex string (e.g., '#FF0000' or '#FF0000FF').
        
        Args:
            hex_color: Hex color string
            
        Returns:
            Color instance
        """
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            r = int(hex_color[0:2], 16) / 255.0
            g = int(hex_color[2:4], 16) / 255.0
            b = int(hex_color[4:6], 16) / 255.0
            return cls(r, g, b)
        elif len(hex_color) == 8:
            r = int(hex_color[0:2], 16) / 255.0
            g = int(hex_color[2:4], 16) / 255.0
            b = int(hex_color[4:6], 16) / 255.0
            a = int(hex_color[6:8], 16) / 255.0
            return cls(r, g, b, a)
        else:
            raise ValueError(f"Invalid hex color format: {hex_color}")
    
    def to_rgb(self) -> Tuple[int, int, int]:
        """Convert to RGB tuple (0-255 range).
        
        Returns:
            Tuple of (red, green, blue) values
        """
        return (int(255 * self.r), int(255 * self.g), int(255 * self.b))
    
    def to_rgba(self) -> Tuple[int, int, int, int]:
        """Convert to RGBA tuple (0-255 range).
        
        Returns:
            Tuple of (red, green, blue, alpha) values
        """
        return (int(255 * self.r), int(255 * self.g), int(255 * self.b), int(255 * self.a))
    
    def to_hex(self) -> str:
        """Convert to hex string.
        
        Returns:
            Hex color string (e.g., '#FF0000FF')
        """
        r, g, b, a = self.to_rgba()
        return f"#{r:02X}{g:02X}{b:02X}{a:02X}"
    
    def to_matplotlib_color(self) -> Tuple[float, float, float, float]:
        """Convert to matplotlib color format.
        
        Returns:
            Tuple of (red, green, blue, alpha) values (0.0-1.0 range)
        """
        return (self.r, self.g, self.b, self.a)
    
    def __str__(self) -> str:
        """String representation of color.
        
        Returns:
            String in format '(r,g,b,a)'
        """
        return f"({self.r:.3f},{self.g:.3f},{self.b:.3f},{self.a:.3f})"
    
    def __repr__(self) -> str:
        """Detailed string representation.
        
        Returns:
            Detailed string representation
        """
        return f"Color({self.r}, {self.g}, {self.b}, {self.a})"
    
    def __eq__(self, other) -> bool:
        """Check equality with another color.
        
        Args:
            other: Other color to compare
            
        Returns:
            True if colors are equal
        """
        if not isinstance(other, Color):
            return False
        return (abs(self.r - other.r) < 1e-9 and
                abs(self.g - other.g) < 1e-9 and
                abs(self.b - other.b) < 1e-9 and
                abs(self.a - other.a) < 1e-9)


# Predefined colors
Color.RED = Color(1.0, 0.0, 0.0, 1.0)
Color.GREEN = Color(0.0, 1.0, 0.0, 1.0)
Color.BLUE = Color(0.0, 0.0, 1.0, 1.0)
Color.WHITE = Color(1.0, 1.0, 1.0, 1.0)
Color.BLACK = Color(0.0, 0.0, 0.0, 1.0)
Color.EMPTY = Color(0.0, 0.0, 0.0, 0.0)
