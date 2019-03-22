/**
 * Triangular Mesh
 * This triangular meshing effect is often shown off in libraries with SVG.
 * Today we’re going to build it with canvas! It’s a great example of
 * how a coordinate system and a little displacement can give clean beautiful effects.
 *
 * https://generativeartistry.com/tutorials/triangular-mesh/
 */
const canvasSketch = require('canvas-sketch');
const { renderPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const { degToRad, lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const {
  translate,
  scale,
  rotateDEG,
  compose,
  applyToPoint
} = require('transformation-matrix');

const settings = {
  dimensions: [20, 20],
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

// Create a seeded random generator
const seeded = random.createRandom(1);

const sketch = ({ width, height }) => {
  // List of polylines for our pen plot
  let lines = [];

  // Sketch setup
  const lineWidth = 0.03;
  const margin = 1.0;
  const padding = 0.0;
  const count = 21;
  const tileSize = (width - margin * 2) / count - padding;

  // 2D Primitives

  // Draw a line
  const line = (x1, y1, x2, y2, group) => {
    const draw = [[x1, y1], [x2, y2]];
    return group ? group.push(draw) : lines.push(draw);
  };
  line(0.0, 0.0, width, height);
  line(0.0, height, width, 0.0);

  // Draw a circle
  const circle = (centerX, centerY, radius, step) => {
    let lastX = -999;
    let lastY = -999;

    for (let angle = 0; angle <= 360; angle += step) {
      const rad = degToRad(angle);
      x = centerX + radius * Math.cos(rad);
      y = centerY + radius * Math.sin(rad);
      if (lastX > -999) line(x, y, lastX, lastY);

      lastX = x;
      lastY = y;
    }
  };
  circle(width / 2, height / 2, 5, 30);

  // Draw a ellipse
  const ellipse = (centerX, centerY, w, h, step) => {
    let lastX = -999;
    let lastY = -999;

    for (let angle = 0; angle <= 360; angle += step) {
      const rad = degToRad(angle);
      x = centerX + w * Math.cos(rad);
      y = centerY + h * Math.sin(rad);
      if (lastX > -999) line(x, y, lastX, lastY);

      lastX = x;
      lastY = y;
    }
  };
  ellipse(width / 2, height / 2, 5, 3, 1);

  // Draw a point
  const point = (x, y, lineWidth) => {
    const weight = lineWidth ? lineWidth : 0.03;
    return circle(x, y, weight, 90);
  };
  point(2, 5);

  // Draw a triangle
  const triangle = (x1, y1, x2, y2, x3, y3, sides) => {
    sides && !sides[0] ? null : line(x1, y1, x2, y2);
    sides && !sides[1] ? null : line(x2, y2, x3, y3);
    sides && !sides[2] ? null : line(x3, y3, x1, y1);
  };
  triangle(3.5, 3.5, 5.5, 5.7, 2.2, 7.5);
  triangle(6.5, 8.7, 9.2, 1.5, 2.5, 12.5, [1, 0, 1]);

  // Draw a rectangle
  const rect = (x, y, w, h, sides) => {
    sides && !sides[0] ? null : line(x, y, x + w, y);
    sides && !sides[1] ? null : line(x + w, y, x + w, y + h);
    sides && !sides[2] ? null : line(x + w, y + h, x, y + h);
    sides && !sides[3] ? null : line(x, y + h, x, y);
  };
  rect(10.0, 10.0, 5.0, 5.0);

  // Draw a quad
  const quad = (x1, y1, x2, y2, x3, y3, x4, y4, sides) => {
    sides && !sides[0] ? null : line(x1, y1, x2, y2);
    sides && !sides[1] ? null : line(x2, y2, x3, y3);
    sides && !sides[2] ? null : line(x3, y3, x4, y4);
    sides && !sides[3] ? null : line(x4, y4, x1, y1);
  };
  quad(2.0, 2.0, width - 2, 4.0, width - 2, height - 2, 2, height - 4);

  // Draw a arc
  // Draw a celd with shapes inside
  // Fill a shape
  // Fill a shape with ()

  // Create a grid
  const createGrid = () => {
    const cell = [];
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        const u = x / (count - 1);
        const v = y / (count - 1);
        cell.push([u, v]);
      }
    }
    return cell;
  };

  const grid = createGrid();
  grid.forEach(([u, v]) => {
    const x = lerp(margin, width - margin, u);
    const y = lerp(margin, height - margin, v);
    point(x, y);
  });

  /*
  const drawDot = (x, y, width, height, positions) => {
    const matrix = compose(
      translate(x, y),
      //rotateDEG(random.value() * 360.0),
      translate(-width / 2, -height / 2)
    );

    for (var i = 0; i < positions.length; i++) {
      const lx = lerp(0, width, positions[i]);
      const ly = lerp(0, height, 0);

      const line = [
        applyToPoint(matrix, [lx, 0]),
        applyToPoint(matrix, [lx, height])
      ];
      !isNaN(line[0][0]) ? lines.push(line) : null;
    }
  };

  const grid = createGrid();
  let odd = true;
  let counter = 0;

  grid.forEach(([u, v]) => {
    const x = lerp(margin * 2, width - margin * 2, u);
    const y = lerp(margin + tileSize, height - margin - tileSize, v);
    const size = 1;

    // Line width
    if (odd) {
      drawDot(x, y, tileSize, tileSize, [0]);
    } else {
      drawDot(x, y, tileSize, tileSize, [0.5]);
    }
    // if (y < aThirdOfHeight) {
    //   square(x, y, tileSize, tileSize, [0.5]);
    // } else if (y < aThirdOfHeight * 2) {
    //   square(x, y, tileSize, tileSize, [0.2, 0.8]);
    // } else {
    //   square(x, y, tileSize, tileSize, [0.1, 0.5, 0.9]);
    // }

    counter++;
    if (counter % count === 0) {
      counter = 0;
      odd = !odd;
    }
  });
  */

  // Clip all the lines to a margin
  // DOCS: https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/geometry.md
  // clipPolylinesToBox(lines, box, border = false, closeLines = true)
  const box = [margin, margin, width - margin, height - margin];
  lines = clipPolylinesToBox(lines, box);

  // Export both PNG and SVG files on 'Cmd + S'
  // DOCS: https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/penplot.md
  return props =>
    renderPolylines(lines, {
      ...props,
      lineWidth
    });
};

canvasSketch(sketch, settings);
