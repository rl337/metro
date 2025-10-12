class SVG:
    def __init__(self, title=None, desc=None):
        self.title = title
        self.desc = desc
        self.shapes = []
        self.styles = {}
        self.style(".Default", Style())

    def render_shapes(self):
        return "\\n".join([f"{x}" for x in self.shapes])

    def style(self, name, style):
        self.styles[name] = style

    def line(self, p1, p2, style=".Default"):
        self.shapes.append(Line(p1, p2, style))

    def polyline(self, points=None, style=".Default"):
        if points is None:
            points = []
        self.shapes.append(Polyline(points, style))

    def circle(self, x, y, r, style=".Default"):
        self.shapes.append(Circle(x, y, r, style))

    def rect(self, x, y, w, h, style=".Default"):
        self.shapes.append(Rect(x, y, w, h, style))

    def __str__(self):
        title = ""
        if self.title is not None:
            title = f"<title>{self.title}</title>\\n"

        desc = ""
        if self.desc is not None:
            desc = f"<desc>{self.desc}</desc>\\n"

        styles = ""
        if len(self.styles) > 0:
            styledefs = "\\n".join([f"{x} {{ {self.styles[x]} }}" for x in self.styles])
            styles = f'<style type="text/css"><![CDATA[\\n{styledefs}\\n]]></style>\\n'

        content = self.render_shapes()
        return f'<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\\n{title}{desc}{styles}{content}\\n</svg>'


class Style:
    def __init__(self, fill="none", stroke="black", stroke_width=1, **kwargs):
        self.attribs = {}
        self.attribs["fill"] = fill
        self.attribs["stroke"] = stroke
        self.attribs["stroke-width"] = stroke_width
        if kwargs is not None:
            for key, value in kwargs.items():
                self.attribs[key] = value

    def __getattr__(self, key):
        return self.attribs[key]

    def __str__(self):
        return "; ".join([f"{x}:{self.attribs[x]}" for x in self.attribs])


class SVGObj:
    def __init__(self, style=".Default"):
        self.style = style

    def _svg_attribs(self):
        if isinstance(self.style, str):
            return f'class="{self.style}"'

        if isinstance(self.style, Style):
            return " ".join(
                [f'{x}="{self.style.attribs[x]}"' for x in self.style.attribs]
            )


class Rect(SVGObj):
    def __init__(self, x, y, w, h, style=".Default"):
        super().__init__(style)
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    def __str__(self):
        return f'<rect x="{self.x}" y="{self.y}" width="{self.w}" height="{self.h}" {self._svg_attribs()}/>'


class Circle(SVGObj):
    def __init__(self, x, y, r, style=".Default"):
        super().__init__(style)
        self.x = x
        self.y = y
        self.r = r

    def __str__(self):
        return (
            f'<circle cx="{self.x}" cy="{self.y}" r="{self.r}" {self._svg_attribs()}/>'
        )


class Polyline(SVGObj):
    def __init__(self, points=None, style=".Default"):
        if points is None:
            points = []
        super().__init__(style)
        self.points = points

    def __str__(self):
        pointlist = " ".join([f"{p[0]},{p[1]}" for p in self.points])
        return f'<polyline points="{pointlist}" {self._svg_attribs()}/>'


class Line(SVGObj):
    def __init__(self, p1, p2, style=".Default"):
        super().__init__(style)
        self.p1 = p1
        self.p2 = p2

    def __str__(self):
        return f'<line x1="{self.p1[0]}" y1="{self.p1[1]}" x2="{self.p2[0]}" y2="{self.p2[1]}" {self._svg_attribs()}/>'
