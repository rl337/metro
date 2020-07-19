package org.rl337.metro.model.things;

import org.rl337.metro.model.Color;
import org.rl337.metro.model.shapes.Shape;

public interface Thing extends Shape {
    Color getColor();
    double getZ();
}
