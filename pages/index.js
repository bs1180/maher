import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap/dist/gsap";
import Head from "next/head";
import mapboxgl from "mapbox-gl";
import { getPage } from "../lib/api";
import { getArc, wrap } from "../components/data";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function Home({ arc = [], ...props }) {
  const mapRef = useRef();
  const mapWrapperRef = useRef();

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
    if (mapWrapperRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapWrapperRef.current,
        style: "mapbox://styles/benedictsmith/ckidiozas0sct19quummf8gmd",
        center: [props.origin.lng, props.origin.lat],
        draggable: false,
        scrollZoom: false,
        zoom: 2,
      });

      mapRef.current.on("load", function () {
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
      <div className="">
        <div
          ref={mapWrapperRef}
          className="z-20 min-h-screen w-full bg-yellow-400 flex items-center justify-center pointer-events-none"
        >
          <div>{" "}</div>
        </div>
        <div className="z-30 absolute top-0 bg-transparent mx-8 my-24 max-w-md space-y-24">
          {props.topLogo?.url && (
            <div className="flex justify-center p-4">
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
        <div className="p-4 md:p-32 bg-black">
          <div
            class="md:max-w-md mx-auto p-4 md:p-6 bg-yellow-50 prose"
            dangerouslySetInnerHTML={{ __html: props.donationBlock.html }}
          />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const contents = await getPage("homepage");

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
      origin,
      arc: getArc(origin, dest),
    },
  };
}
