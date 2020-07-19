package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Bound;
import org.rl337.metro.model.Point2D;

public abstract class AbstractShape extends Bound implements Shape {
    protected AbstractShape(Point2D located, double width, double height) {
        super(located, width, height);
    }

    public boolean contains(Shape shape) {
        Point2D position = shape.getUpperLeft();

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
