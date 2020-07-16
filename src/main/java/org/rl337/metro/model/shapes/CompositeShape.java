package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Point2D;
import org.rl337.metro.model.Shape;

import java.util.ArrayList;
import java.util.List;

public class CompositeShape extends AbstractShape {
    private List<Shape> shapes;

    public CompositeShape() {
        super(Point2D.Origin, 0, 0);
        shapes = new ArrayList<>();
    }

    public CompositeShape(List<Shape> containing) {
        this();

        if (containing == null || containing.size() < 1) {
            return;
        }

        Shape first = containing.get(0);

        double minX = first.getPosition().getX();
        double maxX = minX;
        double minY = first.getPosition().getY();
        double maxY = minY;

        for (int i = 0; i < containing.size(); i++) {
            Shape next = containing.get(i);
            double nextX1 = next.getPosition().getX();
            if (nextX1 < minX) {
                minX = nextX1;
            }

            double nextX2 = nextX1 + next.getWidth();
            if (nextX2 > maxX){
                maxX = nextX2;
            }

            double nextY1 = next.getPosition().getY();
            if (nextY1 < minX) {
                minY = nextY1;
            }

            double nextY2 = nextY1 + next.getWidth();
            if (nextY2 > maxY) {
                maxY = nextY2;
            }
        }

        width = maxX - minX;
        height = maxY - minY;
        position = new Point2D(minX, minY);

        shapes.addAll(containing);
    }

    @Override
    public boolean contains(Point2D point) {
        for (Shape s : shapes) {
            if (s.contains(point)) {
                return true;
            }
        }

        return false;
    }
}
