package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Point2D;

import java.util.ArrayList;
import java.util.List;

public class Group extends AbstractShape {
    private List<Shape> shapes;

    public Group() {
        super(Point2D.Origin, 0, 0);
        shapes = new ArrayList<>();
    }

    public Group(List<Shape> containing) {
        this();

        if (containing == null || containing.size() < 1) {
            return;
        }

        for (Shape next : containing) {
            includeBound(next);
        }

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
