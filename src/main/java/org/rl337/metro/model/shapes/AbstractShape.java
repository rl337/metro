package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Point2D;
import org.rl337.metro.model.Shape;

import java.awt.*;

public abstract class AbstractShape implements Shape {
    protected Point2D position;
    protected double height;
    protected double width;

    protected AbstractShape(Point2D located, double width, double height) {
        this.position = located;
        this.width = width;
        this.height = height;
    }

    @Override
    public double getWidth() {
        return this.width;
    }

    @Override
    public double getHeight() {
        return this.height;
    }

    public Point2D getPosition() {
        return position;
    }

    public Point2D getCenter() {
        return new Point2D(
            position.getX() + width/2,
            position.getY() + height/2
        );
    }


    public boolean contains(Shape shape) {
        Point2D position = shape.getPosition();

        for (int x = 0; x < shape.getWidth(); x++) {
            for (int y = 0; y < shape.getHeight(); y++) {
                Point2D candidate = new Point2D(x + position.getX(), y + position.getY());
                if (!shape.contains(candidate)) {
                    continue;
                }

                if (!contains(candidate)) {
                    return false;
                }
            }
        }

        return true;
    }
}
