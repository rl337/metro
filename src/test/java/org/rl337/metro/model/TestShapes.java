package org.rl337.metro.model;

import org.junit.jupiter.api.Test;
import org.rl337.metro.model.shapes.Circle;
import org.rl337.metro.model.shapes.CompositeShape;
import org.rl337.metro.model.shapes.Rectangle;


import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestShapes {

    @Test
    public void testRectangle() {
        Shape shape = new Rectangle(Point2D.Origin, 10, 10);

        assertTrue(shape.contains(new Point2D(0, 0)));
        assertTrue(shape.contains(new Point2D(10, 10)));

        assertFalse(shape.contains(new Point2D(10, 11)));
        assertFalse(shape.contains(new Point2D(11, 10)));
        assertFalse(shape.contains(new Point2D(0, -1)));
        assertFalse(shape.contains(new Point2D(-1, 0)));
    }

    @Test
    public void testCircle() {
        Shape shape = new Circle(Point2D.Origin, 5);

        assertFalse(shape.contains(new Point2D(0, 0)));
        assertFalse(shape.contains(new Point2D(10, 10)));

        assertFalse(shape.contains(new Point2D(10, 11)));
        assertFalse(shape.contains(new Point2D(11, 10)));
        assertFalse(shape.contains(new Point2D(0, -1)));
        assertFalse(shape.contains(new Point2D(-1, 0)));
    }

    @Test
    public void testComposite() {
        Shape rectangle1 = new Rectangle(Point2D.Origin, 10, 10);
        Shape rectangle2 = new Rectangle(new Point2D(100, 100), 10, 10);

        Shape compositeShape = new CompositeShape(Arrays.asList(rectangle1, rectangle2));
        assertEquals(compositeShape.getWidth(), 110.0);
        assertEquals(compositeShape.getHeight(), 110.0);

        assertTrue(compositeShape.contains(new Point2D(0, 0)));
        assertTrue(compositeShape.contains(new Point2D(10, 10)));

        assertFalse(compositeShape.contains(new Point2D(10, 11)));
        assertFalse(compositeShape.contains(new Point2D(11, 10)));
        assertFalse(compositeShape.contains(new Point2D(0, -1)));
        assertFalse(compositeShape.contains(new Point2D(-1, 0)));

        assertTrue(compositeShape.contains(new Point2D(100, 100)));
        assertTrue(compositeShape.contains(new Point2D(110, 110)));

        assertFalse(compositeShape.contains(new Point2D(100 + 10, 100 + 11)));
        assertFalse(compositeShape.contains(new Point2D(100 + 11, 100 + 10)));
        assertFalse(compositeShape.contains(new Point2D(100 + 0, 100 - 1)));
        assertFalse(compositeShape.contains(new Point2D(100 - 1, 100 + 0)));
    }

}
