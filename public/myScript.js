tool.minDistance = 10;
tool.maxDistance = 45;

var path;

function onMouseDown(event) {
		path = new Path();
		path.fillColor = new Color({
				hue: Math.random() * 360,
				saturation: 1,
				brightness: 1
		});

		path.add(event.point);
}

function onMouseDrag(event) {
		var step = event.delta / 2;
		step.angle += 90;

		var top = event.middlePoint + step;
		var bottom = event.middlePoint - step;

		path.add(top);
		path.insert(0, bottom);
		path.smooth();
}

function onMouseUp(event) {
		path.add(event.point);
		path.closed = true;
		path.smooth();
}