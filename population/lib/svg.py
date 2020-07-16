
class SVG:
    def __init__(self, title=None, desc=None):
        self.title = title
        self.desc = desc
        self.shapes = []
        self.styles = {}
        self.style('.Default', Style())

    def render_shapes(self):
        rendered = [ "%s" % x for x in self.shapes ]
        return "\n".join(rendered)

    def style(self, name, style):
        self.styles[name] = style

    def line(self, p1, p2, style='.Default'):
        self.shapes.append(Line(p1, p2, style))

    def polyline(self, points=[], style='.Default'):
        self.shapes.append(Polyline(points, style))

    def circle(self, x, y, r, style='.Default'):
        self.shapes.append(Circle(x, y, r, style))
       
    def rect(self, x, y, w, h, style='.Default'):
        self.shapes.append(Rect(x, y, w, h, style))

    def __str__(self):
        title = ''
        if self.title is not None:
            title = '<title>%s</title>\n' % self.title

        desc = ''
        if self.desc is not None:
            desc = '<desc>%s</desc>\n' % self.desc

        styles = ''
        if len(self.styles) > 0:
            styledefs="\n".join(["%s { %s }" % (x, self.styles[x]) for x in self.styles])
            styles = '<style type="text/css"><![CDATA[\n%s\n]]></style>\n' % styledefs

        content = self.render_shapes() 
        return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n%s%s%s%s\n</svg>' % (
            title,
            desc,
            styles,
            content
        )

class Style:
    def __init__(self, fill='none', stroke='black', stroke_width=1, **kwargs):
        self.attribs = {}
        self.attribs['fill'] = fill
        self.attribs['stroke'] = stroke
        self.attribs['stroke-width'] = stroke_width
        if kwargs is not None:
            for key, value in kwargs.iteritems():
                self.attribs[key] = value

    def __getattr__(self, key):
        return self.attribs[key]

    def __str__(self):
        return '; '.join(['%s:%s' % (x, self.attribs[x]) for x in self.attribs])

class SVGObj:
    def __init__(self, style='.Default'):
        self.style = style

    def _svg_attribs(self):
        if type(self.style) == str:
            return 'class="%s"' % self.style

        if isinstance(self.style, Style):
            return ' '.join(['%s="%s"' % (x, self.style.attribs[x]) for x in self.style.attribs])
            
class Rect(SVGObj):
    def __init__(self, x, y, w, h, style='.Default'):
        SVGObj.__init__(self, style)
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    def __str__(self):
        return '<rect x="%d" y="%d" width="%d" height="%d" %s/>' % (
            self.x,
            self.y,
            self.w,
            self.h,
            self._svg_attribs()
        )

class Circle(SVGObj):
    def __init__(self, x, y, r, style='.Default'):
        SVGObj.__init__(self, style)
        self.x = x
        self.y = y
        self.r = r

    def __str__(self):
        return '<circle cx="%d" cy="%d" r="%d" %s/>' % (
            self.x,
            self.y,
            self.r,
            self._svg_attribs()
        )

class Polyline(SVGObj):
    def __init__(self, points=[], style='.Default'):
        SVGObj.__init__(self, style)
        self.points = points 

    def __str__(self):
        pointlist = " ".join(["%d,%d" % (p[0],p[1]) for p in self.points])
        return '<polyline points="%s" %s/>' % (
            pointlist,
            self._svg_attribs()
        )

class Line(SVGObj):
    def __init__(self, p1, p2, style='.Default'):
        SVGObj.__init__(self, style)
        self.p1 = p1 
        self.p2 = p2 

    def __str__(self):
        return '<line x1="%d" y1="%d" x2="%d" y2="%d" %s/>' % (
            self.p1[0], self.p1[1],
            self.p2[0], self.p2[1],
            self._svg_attribs()
        )
