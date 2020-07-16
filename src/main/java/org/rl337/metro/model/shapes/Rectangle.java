package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Point2D;

public class Rectangle extends AbstractShape {

    public Rectangle(Point2D located, double width, double height) {
        super(located, width, height);
    }

    @Override
    public boolean contains(Point2D point) {
        return point.getX() >= this.position.getX() &&
                point.getX() <= ( this.position.getX() + this.width) &&
                point.getY() >= this.position.getY() &&
                point.getY() <= ( this.position.getY() + this.height);
    }
}
