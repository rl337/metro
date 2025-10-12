"""
Renderer class for Metro rendering system.
Provides 2D graphics rendering capabilities using matplotlib.
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.figure import Figure
import numpy as np
from typing import Optional, Tuple
from .model.thing_stack import ThingStack
from .model.point2d import Point2D
from .model.color import Color


class Renderer:
    """2D graphics renderer using matplotlib."""
    
    def __init__(self, width: int = 1024, height: int = 768, dpi: int = 100):
        """Initialize renderer with specified dimensions.
        
        Args:
            width: Width of the rendering area in pixels
            height: Height of the rendering area in pixels
            dpi: Dots per inch for rendering
        """
        self.width = width
        self.height = height
        self.dpi = dpi
        
        # Create figure and axis
        self.fig = Figure(figsize=(width/dpi, height/dpi), dpi=dpi)
        self.ax = self.fig.add_subplot(111)
        self.ax.set_xlim(0, width)
        self.ax.set_ylim(0, height)
        self.ax.set_aspect('equal')
        self.ax.invert_yaxis()  # Invert Y axis to match screen coordinates
        
        # Set background
        self.ax.set_facecolor('black')
        self.fig.patch.set_facecolor('black')
        
        # Disable axis display
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        self.ax.spines['top'].set_visible(False)
        self.ax.spines['right'].set_visible(False)
        self.ax.spines['bottom'].set_visible(False)
        self.ax.spines['left'].set_visible(False)
    
    def reset_image(self) -> None:
        """Reset the image to black background."""
        self.ax.clear()
        self.ax.set_xlim(0, self.width)
        self.ax.set_ylim(0, self.height)
        self.ax.set_aspect('equal')
        self.ax.invert_yaxis()
        self.ax.set_facecolor('black')
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        self.ax.spines['top'].set_visible(False)
        self.ax.spines['right'].set_visible(False)
        self.ax.spines['bottom'].set_visible(False)
        self.ax.spines['left'].set_visible(False)
    
    def get_pixel(self, point: Point2D) -> Color:
        """Get the color of a pixel at the specified point.
        
        Args:
            point: Point to sample
            
        Returns:
            Color at the point
        """
        # This is a simplified implementation
        # In a real implementation, you'd sample from the actual rendered image
        return Color.BLACK
    
    def render(self, thing_stack: ThingStack) -> None:
        """Render a thing stack to the display.
        
        Args:
            thing_stack: ThingStack to render
        """
        self.reset_image()
        
        # Calculate scaling factors
        stack_width = thing_stack.get_width()
        stack_height = thing_stack.get_height()
        
        if stack_width == 0 or stack_height == 0:
            return
        
        x_scale = self.width / stack_width
        y_scale = self.height / stack_height
        scale = min(x_scale, y_scale)
        
        # Get the offset to center the content
        min_x = thing_stack.get_upper_left().x
        min_y = thing_stack.get_upper_left().y
        
        # Render each thing
        for thing in thing_stack.get_things():
            self._render_thing(thing, scale, min_x, min_y)
    
    def _render_thing(self, thing, scale: float, offset_x: float, offset_y: float) -> None:
        """Render a single thing.
        
        Args:
            thing: Thing to render
            scale: Scaling factor
            offset_x: X offset
            offset_y: Y offset
        """
        from .model.shapes.circle import Circle
        from .model.shapes.rectangle import Rectangle
        from .model.shapes.group import Group
        
        # Get color
        color = thing.get_color()
        if color.a == 0:  # Skip transparent objects
            return
        
        # Convert color to matplotlib format
        r, g, b, a = color.to_matplotlib_color()
        
        if isinstance(thing, Circle):
            self._render_circle(thing, scale, offset_x, offset_y, (r, g, b, a))
        elif isinstance(thing, Rectangle):
            self._render_rectangle(thing, scale, offset_x, offset_y, (r, g, b, a))
        elif isinstance(thing, Group):
            self._render_group(thing, scale, offset_x, offset_y, (r, g, b, a))
        else:
            # For other shapes, render as a bounding box
            self._render_bounding_box(thing, scale, offset_x, offset_y, (r, g, b, a))
    
    def _render_circle(self, circle, scale: float, offset_x: float, offset_y: float, color: Tuple[float, float, float, float]) -> None:
        """Render a circle.
        
        Args:
            circle: Circle to render
            scale: Scaling factor
            offset_x: X offset
            offset_y: Y offset
            color: Color tuple (r, g, b, a)
        """
        center = circle.get_center()
        radius = circle.get_radius()
        
        # Transform coordinates
        x = (center.x - offset_x) * scale
        y = (center.y - offset_y) * scale
        r = radius * scale
        
        # Create circle patch
        circle_patch = patches.Circle((x, y), r, facecolor=color[:3], alpha=color[3])
        self.ax.add_patch(circle_patch)
    
    def _render_rectangle(self, rectangle, scale: float, offset_x: float, offset_y: float, color: Tuple[float, float, float, float]) -> None:
        """Render a rectangle.
        
        Args:
            rectangle: Rectangle to render
            scale: Scaling factor
            offset_x: X offset
            offset_y: Y offset
            color: Color tuple (r, g, b, a)
        """
        upper_left = rectangle.get_upper_left()
        width = rectangle.get_width()
        height = rectangle.get_height()
        
        # Transform coordinates
        x = (upper_left.x - offset_x) * scale
        y = (upper_left.y - offset_y) * scale
        w = width * scale
        h = height * scale
        
        # Create rectangle patch
        rect_patch = patches.Rectangle((x, y), w, h, facecolor=color[:3], alpha=color[3])
        self.ax.add_patch(rect_patch)
    
    def _render_group(self, group, scale: float, offset_x: float, offset_y: float, color: Tuple[float, float, float, float]) -> None:
        """Render a group of shapes.
        
        Args:
            group: Group to render
            scale: Scaling factor
            offset_x: X offset
            offset_y: Y offset
            color: Color tuple (r, g, b, a)
        """
        for shape in group.get_shapes():
            # Create a temporary thing with the group's color
            from .model.things.simple_thing import SimpleThing
            temp_thing = SimpleThing(shape, Color.from_rgb(*[int(c * 255) for c in color[:3]], int(color[3] * 255)), 0)
            self._render_thing(temp_thing, scale, offset_x, offset_y)
    
    def _render_bounding_box(self, thing, scale: float, offset_x: float, offset_y: float, color: Tuple[float, float, float, float]) -> None:
        """Render a thing as its bounding box.
        
        Args:
            thing: Thing to render
            scale: Scaling factor
            offset_x: X offset
            offset_y: Y offset
            color: Color tuple (r, g, b, a)
        """
        upper_left = thing.get_upper_left()
        width = thing.get_width()
        height = thing.get_height()
        
        # Transform coordinates
        x = (upper_left.x - offset_x) * scale
        y = (upper_left.y - offset_y) * scale
        w = width * scale
        h = height * scale
        
        # Create rectangle patch
        rect_patch = patches.Rectangle((x, y), w, h, facecolor=color[:3], alpha=color[3])
        self.ax.add_patch(rect_patch)
    
    def show(self) -> None:
        """Display the rendered image."""
        plt.show()
    
    def save(self, filename: str) -> None:
        """Save the rendered image to a file.
        
        Args:
            filename: Output filename
        """
        self.fig.savefig(filename, dpi=self.dpi, bbox_inches='tight', facecolor='black')
    
    def get_figure(self) -> Figure:
        """Get the matplotlib figure.
        
        Returns:
            Matplotlib figure
        """
        return self.fig
    
    def get_axis(self):
        """Get the matplotlib axis.
        
        Returns:
            Matplotlib axis
        """
        return self.ax
