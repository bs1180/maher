import { useEffect, useRef } from "react";
import { gsap } from "gsap/dist/gsap";
import Head from "next/head";
import mapboxgl from "mapbox-gl";
import { getPage } from "../lib/api";
import { getArc, wrap } from "../components/data";
import { MarkerIcon } from "../components/icon";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const STEPS = 499;

export default function Home({ arc = [], ...props }) {
  const mapRef = useRef();
  const mapWrapperRef = useRef();
  const markerRef = useRef();
  const customMarkerRef = useRef();

  const xRef = useRef({ step: 0 });

  const handleUpdate = () => {
    if (
      xRef.current.step &&
      mapRef.current &&
      mapRef.current.getSource("progress")
    ) {
      const animationProgress = (xRef.current.step / STEPS) * 100;
      const actualProgress = (props.distanceWalked / props.totalRoute) * 100;
      if (actualProgress > animationProgress) {
        const partialArc = arc.slice(0, xRef.current.step);
        mapRef.current.getSource("progress").setData(wrap(partialArc));
        const [last] = arc.slice(xRef.current.step - 1, xRef.current.step);

        markerRef.current.setLngLat(last);
      }
    }
  };

  useEffect(() => {
    gsap.to(xRef.current, {
      step: STEPS,
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
        mapRef.current.addSource("progress", {
          type: "geojson",
          data: wrap([0, 0]),
        });

        mapRef.current.addLayer({
          id: "progress",
          source: "progress",
          type: "line",
          paint: {
            "line-width": 2,
            "line-color": "#000000",
          },
        });

        mapRef.current.addSource("route", {
          type: "geojson",
          data: wrap(arc),
        });

        mapRef.current.addLayer(
          {
            id: "route",
            source: "route",
            type: "line",
            paint: {
              "line-width": 2,
              "line-color": "gray",
              "line-opacity": 0.5,
            },
          },
          "progress"
        );
      });

      markerRef.current = new mapboxgl.Marker(customMarkerRef.current);

      markerRef.current.setLngLat([props.origin.lng, props.origin.lat]);

      markerRef.current.addTo(mapRef.current);
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
          <div> </div>
          <div ref={customMarkerRef}>
            <MarkerIcon className="h-6 w-6" />
          </div>
        </div>
        <div className="z-30 absolute top-0 bg-transparent mx-8 my-24 max-w-md space-y-24">
          {props.topLogo?.url && (
            <div className="flex justify-center p-4">
              <img src={props.topLogo?.url} alt="" />
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: props.firstBlock.html }}
            className="p-8 bg-white opacity-75 prose"
          />
          <div
            dangerouslySetInnerHTML={{ __html: props.secondBlock.html }}
            className="p-8 bg-white opacity-75 prose"
          />
          <div
            id="last"
            className="p-8 p-8 bg-white opacity-75 prose"
            dangerouslySetInnerHTML={{ __html: props.thirdBlock.html }}
          />
        </div>
        <div className="p-4 md:p-32 bg-black">
          <div
            className="md:max-w-md mx-auto p-4 md:p-6 bg-yellow-50 prose"
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

  const { arc, lineDistance: totalRoute } = getArc(origin, dest);

  return {
    props: {
      ...contents,
      origin,
      arc,
      totalRoute,
    },
  };
}
