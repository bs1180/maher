export const createBoxes = (x) => {
  const placeholders = [...Array(x)].map((_, i) => ({
    // todo: make quote and image boxes
    _type: "text",
    id: i,
    title: `Box ${i}`,
    contents:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque convallis, lacus volutpat auctor ultrices, leo nunc consequat est, ut tempor ligula felis nec arcu. Pellentesque eu ligula in tortor ullamcorper viverra sit amet eu quam. Suspendisse elementum, sem eget hendrerit ullamcorper, odio mi finibus tortor, at scelerisque nisl lorem at ligula. Sed ultricies metus lacus, nec rutrum leo bibendum eget. Vivamus tortor nibh, tempor et elit in, rutrum aliquet ex. Aenean hendrerit justo in porta scelerisque.",
  }));

  const quote = { _type: "quote", content: "In a gentle way, you can shake the world", author: "Gandi" };

  return [quote, ...placeholders];
};

import length from "@turf/length";
import along from "@turf/along";

// precalculate the co-ordinates, then update bit by bit
// how to scrub backwards? slice the array?



export const createLine = (origin, dest) => {
  let route = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [[0, 0]],
        },
      },
    ],
  };

  const arc = calculateArc({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [origin.lng, origin.lat],
        [dest.lng, dest.lat],
      ],
    },
  });

  return (step) => {
    const line = arc.slice(0, step);
    route.features[0].geometry.coordinates = arc;

    return route;
  };
};

export const getArc = (origin, dest) => calculateArc({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [
      [origin.lng, origin.lat],
      [dest.lng, dest.lat],
    ],
  },
});

export const wrap = (coordinates) => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates
  },
});

const calculateArc = (lineFeature) => {
  var arc = [];

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = 500;

  var lineDistance = length(lineFeature, "kilometers");

  // Draw an arc between the `origin` & `destination` of the two points
  for (var i = 0; i < lineDistance; i += lineDistance / steps) {
    var segment = along(lineFeature, i, "kilometers");
    arc.push(segment.geometry.coordinates);
  }

  return arc;
};
