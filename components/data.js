import length from "@turf/length";
import along from "@turf/along";

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

export const getArc = (origin, dest) =>
  calculateArc({
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
    coordinates,
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

  return { arc, lineDistance };
};
