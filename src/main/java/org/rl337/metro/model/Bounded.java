package org.rl337.metro.model;

public interface Bounded {
    double getWidth();

    double getHeight();

    boolean isInBound(Point2D point);

    Point2D getUpperLeft();

    Point2D getLowerRight();

    Point2D getCenter();
}
