package org.rl337.metro.model.shapes;

import org.rl337.metro.model.Bounded;
import org.rl337.metro.model.Point2D;

public interface Shape extends Bounded {
    boolean contains(Point2D point);
    boolean contains(Shape shape);
}
