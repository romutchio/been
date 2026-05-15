"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { countryByNumericId, getCountryName } from "@/lib/countries";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const MAP_URL = "/world-atlas/countries-110m.json";

type Props = {
  visited: Set<string>;
  wishlist: Set<string>;
  friendVisited?: Set<string>;
  onCountryClick?: (code: string) => void;
  selectedCode?: string | null;
  focusCode?: string | null;
};

type CountryFeature = Feature<Geometry, { name: string }>;

const WIDTH = 960;
const HEIGHT = 500;

function numericToCode(id: string): string | null {
  const padded = id.padStart(3, "0");
  return countryByNumericId.get(padded)?.code ?? null;
}

export function WorldMap({
  visited,
  wishlist,
  friendVisited,
  onCountryClick,
  selectedCode,
  focusCode,
}: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    fetch(MAP_URL)
      .then((r) => r.json())
      .then((topology: Topology) => {
        const countries = topology.objects.countries as GeometryCollection;
        setGeo(feature(topology, countries) as FeatureCollection);
      })
      .finally(() => setLoading(false));
  }, []);

  const { projection, pathGen, features } = useMemo(() => {
    if (!geo) {
      return {
        projection: null,
        pathGen: null,
        features: [] as CountryFeature[],
      };
    }
    const proj = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geo);
    return {
      projection: proj,
      pathGen: geoPath(proj),
      features: geo.features as CountryFeature[],
    };
  }, [geo]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !geo) return;

    const svg = select(svgRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        select(gRef.current).attr("transform", event.transform);
      });

    svg.call(behavior);
    zoomRef.current = behavior;

    return () => {
      svg.on(".zoom", null);
    };
  }, [geo]);

  useEffect(() => {
    if (!focusCode || !projection || !gRef.current || !zoomRef.current || !svgRef.current) return;

    const countryFeature = features.find(
      (f) => numericToCode((f.id ?? "").toString()) === focusCode,
    );
    if (!countryFeature) return;

    const bounds = geoPath(projection).bounds(countryFeature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.min(6, 0.85 / Math.max(dx / WIDTH, dy / HEIGHT));
    const translate: [number, number] = [
      WIDTH / 2 - scale * x,
      HEIGHT / 2 - scale * y,
    ];

    select(svgRef.current).call(
      zoomRef.current!.transform,
      zoomIdentity.translate(translate[0], translate[1]).scale(scale),
    );
  }, [focusCode, projection, features]);

  function fillFor(code: string | null): string {
    if (!code) return "var(--map-default)";
    if (selectedCode === code || focusCode === code) return "var(--map-selected)";

    const mine = visited.has(code);
    const friend = friendVisited?.has(code) ?? false;

    if (mine && friend) return "var(--map-both)";
    if (mine) return "var(--map-visited)";
    if (friend) return "var(--map-friend)";
    if (wishlist.has(code)) return "var(--map-wishlist)";
    return "var(--map-default)";
  }

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).call(zoomRef.current.scaleBy, factor);
  }

  function resetZoom() {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).call(zoomRef.current.transform, zoomIdentity);
  }

  const tooltipCode = hovered ?? selectedCode ?? focusCode;

  if (loading) {
    return (
      <div className="flex h-[min(52vh,500px)] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <span className="text-sm text-zinc-400">Загрузка карты…</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        <MapButton onClick={() => zoomBy(1.4)} label="Увеличить">
          <ZoomIn className="h-4 w-4" />
        </MapButton>
        <MapButton onClick={() => zoomBy(0.7)} label="Уменьшить">
          <ZoomOut className="h-4 w-4" />
        </MapButton>
        <MapButton onClick={resetZoom} label="Сброс">
          <RotateCcw className="h-4 w-4" />
        </MapButton>
      </div>
      <p className="pointer-events-none absolute bottom-3 right-3 z-10 text-xs text-zinc-600">
        Колёсико — зум · перетаскивание — перемещение
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Карта мира"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#0d1117" />
        <g ref={gRef}>
          {features.map((f, i) => {
            const id = (f.id ?? "").toString();
            const code = numericToCode(id);
            const d = pathGen?.(f) ?? "";
            if (!d) return null;

            return (
              <path
                key={`${id}-${i}`}
                d={d}
                fill={fillFor(code)}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.5}
                className={
                  code && onCountryClick
                    ? "cursor-pointer transition-[fill] duration-150 hover:brightness-125"
                    : ""
                }
                onMouseEnter={() => code && setHovered(code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => code && onCountryClick?.(code)}
              />
            );
          })}
        </g>
      </svg>
      {tooltipCode && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-sm backdrop-blur">
          <span className="font-medium">{getCountryName(tooltipCode)}</span>
          <span className="ml-2 text-zinc-400">{tooltipCode}</span>
        </div>
      )}
    </div>
  );
}

function MapButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-lg border border-white/10 bg-black/60 p-2 text-zinc-300 backdrop-blur hover:bg-black/80 hover:text-white"
    >
      {children}
    </button>
  );
}
