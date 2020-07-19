package org.rl337.metro.model;

public class Bound implements Bounded {
    private double x1;
    private double x2;
    private double y1;
    private double y2;

    public Bound() {
        x1 = 0;
        x2 = 0;
        y1 = 0;
        y2 = 0;
    }

    public Bound(Point2D at, double width, double height) {
        x1 = at.getX();
        x2 = x1 + width;
        y1 = at.getY();
        y2 = y1 + height;
    }

    public Bound(Bound other) {
        x1 = other.x1;
        x2 = other.x2;
        y1 = other.y1;
        y2 = other.y2;
    }

    protected void includePoint(Point2D point) {
        if (point.getX() < x1) {
            x1 = point.getX();
        } else if (point.getX() > x2) {
            x2 = point.getX();
        }

        if (point.getY() < y1) {
            y1 = point.getY();
        } else if (point.getY() > y2) {
            y2 = point.getY();
        }
    }

    protected void includeBound(Bounded other) {
        includePoint(other.getUpperLeft());
        includePoint(other.getLowerRight());
    }

    public boolean isInBound(Point2D point) {
        return point.getX() >= x1 &&
                point.getX() <= x2 &&
                point.getY() >= y1 &&
                point.getY() <= y2;
    }

    @Override
    public double getWidth() {
        return x2 - x1;
    }

    @Override
    public double getHeight() {
        return y2 - y1;
    }

    @Override
    public Point2D getUpperLeft() {
        return new Point2D(x1, y1);
    }

    @Override
    public Point2D getLowerRight() {
        return new Point2D(x2, y2);
    }

    @Override
    public Point2D getCenter() {
        return new Point2D((x2 + x1) / 2, (y2 + y1) / 2);
    }
}
