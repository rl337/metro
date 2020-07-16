package org.rl337.metro.model;

public interface Shape {
    Point2D getPosition();
    double getWidth();
    double getHeight();
    boolean contains(Point2D point);
    boolean contains(Shape shape);

}
