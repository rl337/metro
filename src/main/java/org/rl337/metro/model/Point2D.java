package org.rl337.metro.model;

public class Point2D {
    public static final Point2D Origin = new Point2D(0, 0);

    private double x;
    private double y;

    public Point2D(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Point2D(Point2D other) {
        this.x = other.x;
        this.y = other.y;
    }

    public double getX() {
        return x;
    }
    public double getY() {
        return y;
    }
}
