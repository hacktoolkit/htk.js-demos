var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
    el: $('#paper_container'),
    width: 600,
    height: 200,
    model: graph,
    gridSize: 1
});

var paperSmall = new joint.dia.Paper({
    el: $('#paper_container_small'),
    width: 600,
    height: 100,
    model: graph,
    gridSize: 1
});
paperSmall.scale(.5);
paperSmall.$el.css('pointer-events', 'none');

var rect = new joint.shapes.basic.Rect({
    position: { x: 100, y: 30 },
    size: { width: 100, height: 30 },
    attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
});

var rect2 = rect.clone();
rect2.attr({
    rect: {
        fill: 'red'
    },
    text: {
        text: 'my box clone'
    }
});
rect2.translate(300);

var rect3 = rect.clone();
rect3.attr({
    rect: { fill: '#2C3E50', rx: 5, ry: 5, 'stroke-width': 2, stroke: 'black' },
    text: {
        text: 'my label', fill: '#3498DB',
        'font-size': 18, 'font-weight': 'bold', 'font-variant': 'small-caps', 'text-transform': 'capitalize'
    }
});
rect3.translate(250, 100);

var link = new joint.dia.Link({
    source: { id: rect.id },
    target: { id: rect2.id }
});

var circle = new joint.shapes.basic.Circle();
var ellipse = new joint.shapes.basic.Ellipse();
var rhombus = new joint.shapes.basic.Rhombus();
var polygon = new joint.shapes.basic.Polygon();
var polyline = new joint.shapes.basic.Polyline();

graph.on('all', function(eventName, cell) {
    console.log(arguments);
});

rect.on('change:position', function(element) {
    console.log(element.id, ':', element.get('position'));
});

var elements = [
    rect,
    rect2,
    rect3,
    link,
    circle,
    ellipse,
    rhombus,
    polygon,
    polyline
];

graph.addCells(elements);
