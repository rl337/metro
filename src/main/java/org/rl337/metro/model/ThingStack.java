package org.rl337.metro.model;

import org.rl337.metro.model.things.Thing;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ThingStack extends Bound {
    List<Thing> ordered;

    public ThingStack(List<Thing> things) {
        ordered = new ArrayList<>();

        for (Thing thing : things) {
            includeBound(thing);
        }

        ordered.addAll(things);
        ordered.sort(Comparator.comparingDouble(Thing::getZ));
    }

    public List<Thing> getThingList() {
        return List.copyOf(ordered);
    }
}
