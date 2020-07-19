package org.rl337.metro;

import org.rl337.metro.model.Point2D;
import org.rl337.metro.model.ThingStack;
import org.rl337.metro.model.things.Thing;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.List;

public class Renderer {
    BufferedImage image;

    public Renderer(int width, int height) {
        this.image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        resetImage();
    }

    public void resetImage() {
        Graphics g2d = image.getGraphics();
        g2d.setColor(Color.BLACK);
        g2d.fillRect(0, 0, image.getWidth(), image.getHeight());
    }

    public void render(ThingStack shapes) {
        double xScale = shapes.getWidth() / image.getWidth();
        double yScale = shapes.getHeight() / image.getHeight();

        double scale = Math.max(xScale, yScale);

        Graphics g2d = image.getGraphics();

        double minX = shapes.getUpperLeft().getX();
        double minY = shapes.getUpperLeft().getY();

        List<Thing> thingList = shapes.getThingList();
        for (double x = 0; x < image.getWidth(); x++) {
            for (double y = 0; y < image.getHeight(); y++) {
                Point2D point = new Point2D(x * scale + minX, y * scale + minY);
                for (Thing thing : thingList) {
                    if (thing.contains(point)) {
                        g2d.setColor(thing.getColor().asAWTColor());
                        g2d.drawRect((int) x, (int) y, 1, 1);
                    }
                }
            }
        }
    }

    public void show() {
        JLabel label = new JLabel(new ImageIcon(image));

        JPanel panel = new JPanel();
        Dimension size = new Dimension(image.getWidth(), image.getHeight());
        panel.setSize(size);
        panel.setPreferredSize(size);
        panel.add(label);

        JFrame f = new JFrame();
        f.setContentPane(panel);
        f.pack();
        f.setVisible(true);
        f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}
