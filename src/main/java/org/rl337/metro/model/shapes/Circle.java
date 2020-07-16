package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Point2D;

public class Circle extends AbstractShape {

    public Circle(Point2D located, double radius) {
        super(located, radius * 2, radius * 2);
    }

    public double getRadius() {
        return getWidth() / 2;
    }

    @Override
    public boolean contains(Point2D point) {
        Point2D center = getCenter();

        double ty = point.getY() - center.getY();

        double rowWidth = Math.sqrt(getRadius() * getRadius() - ty * ty);
        double tx1 = center.getX() - rowWidth;
        double tx2 = center.getX() + rowWidth;

        return point.getX() >= tx1 && point.getX() <= tx2;
    }
}
