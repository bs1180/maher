import { useEffect, useRef, useState, createRef } from "react";
import { gsap } from "gsap/dist/gsap";
import Head from "next/head";
import { useWindowScroll } from "react-use";
import { useWindowSize } from "react-use";
import mapboxgl from "mapbox-gl";
import { QuoteBlock, TextBlock } from "../components/blocks";

import { createBoxes, createLine, getArc, wrap } from "../components/data";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const origin = {
  lat: 48.14652,
  lng: 16.38326,
};

const dest = {
  lng: 76.21989,
  lat: 24.42479,
};

export default function Home({ blocks = [], arc = [] }) {
  const mapRef = useRef();
  const mapWrapperRef = useRef();
  const [blockRefs, setBlockRefs] = useState([]);
  const [loading, setLoading] = useState(true);

  const blockLength = blocks.length;

  useEffect(() => {
    setBlockRefs((elRefs) =>
      Array(blockLength)
        .fill()
        .map((_, i) => blockRefs[i] || createRef())
    );
  }, [blockLength]);

  const xRef = useRef({ step: 0 });

  const handleUpdate = () => {
    if (xRef.current.step && mapRef.current && mapRef.current.getSource("route")) {
      const partialArc = arc.slice(0, xRef.current.step);
      mapRef.current.getSource("route").setData(wrap(partialArc));
    }
  };

  useEffect(() => {
    if (blockRefs.length) {
      gsap.to(xRef.current, {
        step: 499,
        snap: "step",
        scrollTrigger: {
          trigger: mapWrapperRef.current,
          start: "top top",
          endTrigger: blockRefs[blockLength - 1].current,
          end: "center center",
          scrub: 0.5,
          pin: true,
        },
        onUpdate: handleUpdate,
      });
    }
  }, [mapWrapperRef, blockRefs]);

  useEffect(() => {
    if (false || mapWrapperRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapWrapperRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [origin.lng, origin.lat],
        draggable: false,
        scrollZoom: false,
        zoom: 2,
      });

      mapRef.current.on("load", function () {
        setLoading(false)
        mapRef.current.addSource("route", {
          type: "geojson",
          data: wrap([0, 0]),
        });

        mapRef.current.addLayer({
          id: "route",
          source: "route",
          type: "line",
          paint: {
            "line-width": 2,
            "line-color": "#007cbf",
          },
        });
      });
    }
  }, [mapWrapperRef]);

  const renderBlock = ({ _type, ...rest }) => {
    return _type === "quote" ? <QuoteBlock {...rest} /> : _type === "image" ? null : <TextBlock {...rest} />;
  };

  return (
    <div>
      <Head>
        <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div className={`bg-black inset-0 absolute z-50 text-white ${loading ? "absolute" : "hidden"}`}>loading...</div>
      <div className="">
        <div
          ref={mapWrapperRef}
          className="z-20 h-screen w-full bg-red-500 flex items-center justify-center pointer-events-none"
        >
          <div>map goes here </div>
        </div>
        <div className="z-30 absolute top-0 space-y-64 bg-transparent m-6 max-w-md ">
          {blocks.map((props, i) => (
            <div key={i} ref={blockRefs[i]}>
              {renderBlock(props)}
            </div>
          ))}
        </div>
        <div className="p-32 bg-teal-100">
          <div>Pledge some money</div>
        </div>
        <footer className="p-32 bg-gray-800">
          <div>Built by Ben Smith</div>
        </footer>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      blocks: createBoxes(4),
      arc: getArc(origin, dest),
    },
  };
}
