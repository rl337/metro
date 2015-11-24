import svg

if __name__ == '__main__':
    img = svg.SVG('Test SVG Document', 'The original document can be found on the SVG Wiki page')
    img.shapes = [
        svg.Rect(0, 0, 250, 250, 'Default'),
        svg.Rect(25, 25, 200, 200, svg.Style('lime', 'pink', 4)),
        svg.Circle(125, 125, 75, svg.Style('orange', 'none', 0)),
        svg.Polyline([(50,150),(50,200),(200,200),(200,100)], svg.Style('none', 'red', 4)),
        svg.Line((50,50), (200,200), svg.Style('none', 'blue', 4))
    ]
    print img
