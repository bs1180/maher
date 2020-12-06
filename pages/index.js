import { useEffect, useRef, useState, createRef } from "react";
import { gsap } from "gsap/dist/gsap";
import Head from "next/head";
import { useWindowScroll } from "react-use";
import { useWindowSize } from "react-use";
import mapboxgl from "mapbox-gl";
import { QuoteBlock, TextBlock } from "../components/blocks";
import { getPage } from "../lib/api";

import { createBoxes, createLine, getArc, wrap } from "../components/data";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const origin = {
  lat: 48.14652,
  lng: 16.38326,
};

const dest = {
  lng: 76.21989,
  lat: 24.42479,
};

export default function Home({ blocks = [], arc = [], ...props }) {
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
    if (
      xRef.current.step &&
      mapRef.current &&
      mapRef.current.getSource("route")
    ) {
      const partialArc = arc.slice(0, xRef.current.step);
      mapRef.current.getSource("route").setData(wrap(partialArc));
    }
  };

  useEffect(() => {
    gsap.to(xRef.current, {
      step: 499,
      snap: "step",
      scrollTrigger: {
        trigger: mapWrapperRef.current,
        start: "top top",
        endTrigger: "#last",
        end: "center center",
        scrub: 0.5,
        pin: true,
      },
      onUpdate: handleUpdate,
    });
  }, [mapWrapperRef]);

  useEffect(() => {
    if (false || mapWrapperRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapWrapperRef.current,
        style: "mapbox://styles/benedictsmith/ckidiozas0sct19quummf8gmd",
        center: [origin.lng, origin.lat],
        draggable: false,
        scrollZoom: false,
        zoom: 2,
      });

      mapRef.current.on("load", function () {
        setLoading(false);
        mapRef.current.addSource("route", {
          type: "geojson",
          data: wrap([0, 0]),
        });

        mapRef.current.addLayer({
          id: "route",
          source: "route",
          type: "line",
          paint: {
            "line-width": 3,
            "line-color": "#000000",
          },
        });
      });
    }
  }, [mapWrapperRef]);

  return (
    <div>
      <Head>
        <title>Walk with us!</title>
        <link
          href="https://api.tiles.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <div
        className={`bg-black inset-0 absolute z-50 text-white ${
          loading ? "absolute" : "hidden"
        }`}
      >
        loading...
      </div>
      <div className="">
        <div
          ref={mapWrapperRef}
          className="z-20 h-screen w-full bg-red-500 flex items-center justify-center pointer-events-none"
        >
          <div>map goes here </div>
        </div>
        <div className="z-30 absolute top-0 bg-transparent mx-8 my-24 max-w-md space-y-24">
          {props.topLogo?.url && (
            <div class="flex justify-center p-4">
              <img src={props.topLogo?.url} alt="" />
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: props.firstBlock.html }}
            class="p-8 bg-white opacity-75 prose"
          />
                    <div
            dangerouslySetInnerHTML={{ __html: props.secondBlock.html }}
            class="p-8 bg-white opacity-75 prose"
          />
          <div
            id="last"
            class="p-8 p-8 bg-white opacity-75 prose"
            dangerouslySetInnerHTML={{ __html: props.thirdBlock.html }}
          />
        </div>
        <div className="p-32 bg-black">
          <div
            class="max-w-md mx-auto p-6 bg-yellow-50 prose"
            dangerouslySetInnerHTML={{ __html: props.donationBlock.html }}
          />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const contents = await getPage("homepage");
  console.log(contents);

  const origin = {
    lat: contents.originPointLatitude,
    lng: contents.originPointLongitude,
  };

  const dest = {
    lat: contents.destinationPointLatitude,
    lng: contents.destinationPointLongitude,
  };

  return {
    props: {
      ...contents,
      blocks: [],
      arc: getArc(origin, dest),
    },
  };
}
