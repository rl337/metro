package org.rl337.metro.model.things;

import org.rl337.metro.model.Color;
import org.rl337.metro.model.Point2D;
import org.rl337.metro.model.shapes.Shape;

public class SimpleThing implements Thing {
    private Shape shape;
    private Color color;
    private double z;

    public SimpleThing(Shape ofShape, Color c, double atZ) {
        color = c;
        z = atZ;
        shape = ofShape;
    }

    @Override
    public Color getColor() {
        return color;
    }

    @Override
    public double getZ() {
        return z;
    }

    @Override
    public boolean contains(Point2D point) {
        return shape.contains(point);
    }

    @Override
    public boolean contains(Shape shape) {
        return shape.contains(shape);
    }

    @Override
    public double getWidth() {
        return shape.getWidth();
    }

    @Override
    public double getHeight() {
        return shape.getWidth();
    }

    @Override
    public boolean isInBound(Point2D point) {
        return shape.isInBound(point);
    }

    @Override
    public Point2D getUpperLeft() {
        return shape.getUpperLeft();
    }

    @Override
    public Point2D getLowerRight() {
        return shape.getLowerRight();
    }

    @Override
    public Point2D getCenter() {
        return shape.getCenter();
    }
}
