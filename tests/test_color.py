"""
Tests for Metro Color class.
"""

# import pytest
from metro.model.color import Color


class TestColor:
    """Test cases for Color class."""

    def test_color_creation(self):
        """Test basic color creation."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        assert color.r == 1.0
        assert color.g == 0.5
        assert color.b == 0.0
        assert color.a == 0.8

    def test_color_clamping(self):
        """Test that color values are clamped to 0.0-1.0 range."""
        color = Color(2.0, -0.5, 0.5, 1.5)
        assert color.r == 1.0
        assert color.g == 0.0
        assert color.b == 0.5
        assert color.a == 1.0

    def test_from_rgb(self):
        """Test creating color from RGB values."""
        color = Color.from_rgb(255, 128, 64, 200)
        assert color.r == 1.0
        assert color.g == 128 / 255
        assert color.b == 64 / 255
        assert color.a == 200 / 255

    def test_from_hex(self):
        """Test creating color from hex string."""
        color = Color.from_hex("#FF8040")
        assert color.r == 1.0
        assert color.g == 128 / 255
        assert color.b == 64 / 255
        assert color.a == 1.0

        color_with_alpha = Color.from_hex("#FF8040CC")
        assert color_with_alpha.r == 1.0
        assert color_with_alpha.g == 128 / 255
        assert color_with_alpha.b == 64 / 255
        assert color_with_alpha.a == 204 / 255

    def test_to_rgb(self):
        """Test converting to RGB tuple."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        rgb = color.to_rgb()
        assert rgb == (255, 127, 0)  # 0.5 * 255 = 127.5, truncated to 127

    def test_to_rgba(self):
        """Test converting to RGBA tuple."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        rgba = color.to_rgba()
        assert rgba == (255, 127, 0, 204)  # 0.5 * 255 = 127.5, truncated to 127

    def test_to_hex(self):
        """Test converting to hex string."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        hex_str = color.to_hex()
        assert hex_str == "#FF7F00CC"  # 0.5 * 255 = 127.5, truncated to 127

    def test_to_matplotlib_color(self):
        """Test converting to matplotlib color format."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        matplotlib_color = color.to_matplotlib_color()
        assert matplotlib_color == (1.0, 0.5, 0.0, 0.8)

    def test_string_representation(self):
        """Test string representations."""
        color = Color(1.0, 0.5, 0.0, 0.8)
        assert str(color) == "(1.000,0.500,0.000,0.800)"
        assert "Color(1.0, 0.5, 0.0, 0.8)" in repr(color)

    def test_equality(self):
        """Test color equality."""
        color1 = Color(1.0, 0.5, 0.0, 0.8)
        color2 = Color(1.0, 0.5, 0.0, 0.8)
        color3 = Color(1.0, 0.5, 0.0, 0.9)

        assert color1 == color2
        assert color1 != color3
        assert color1 != "not a color"

    def test_predefined_colors(self):
        """Test predefined color constants."""
        assert Color.RED.r == 1.0 and Color.RED.g == 0.0 and Color.RED.b == 0.0
        assert Color.GREEN.r == 0.0 and Color.GREEN.g == 1.0 and Color.GREEN.b == 0.0
        assert Color.BLUE.r == 0.0 and Color.BLUE.g == 0.0 and Color.BLUE.b == 1.0
        assert Color.WHITE.r == 1.0 and Color.WHITE.g == 1.0 and Color.WHITE.b == 1.0
        assert Color.BLACK.r == 0.0 and Color.BLACK.g == 0.0 and Color.BLACK.b == 0.0
        assert Color.EMPTY.a == 0.0
