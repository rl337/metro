package org.rl337.metro.model;

public class Color {
    private double r;
    private double g;
    private double b;
    private double a;

    private Color(double red, double green, double blue, double alpha) {
        r = red;
        g = green;
        b = blue;
        a = alpha;
    }

    public double getR() {
        return r;
    }

    public double getG() {
        return g;
    }

    public double getB() {
        return b;
    }

    public double getA() {
        return a;
    }

    public java.awt.Color asAWTColor() {
        return new java.awt.Color((int) (255 * r), (int) (255 * g), (int) (255 * b), (int) (255 * a));
    }

    public static final Color Red = new Color(1.0, 0.0, 0.0, 1.0);
    public static final Color Green = new Color(0.0, 1.0, 0.0, 1.0);
    public static final Color Blue = new Color(0.0, 0.0, 1.0, 1.0);

    public static final Color White = new Color(1.0, 1.0, 1.0, 1.0);
    public static final Color Black = new Color(0.0, 0.0, 0.0, 1.0);

}
