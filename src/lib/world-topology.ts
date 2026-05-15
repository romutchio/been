import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";

let cached: FeatureCollection | null = null;
let loading: Promise<FeatureCollection> | null = null;

/** TopoJSON → GeoJSON once per session (bundled chunk, no extra HTTP). */
export function loadWorldMapGeo(): Promise<FeatureCollection> {
  if (cached) return Promise.resolve(cached);
  if (!loading) {
    loading = import("@/data/world-topology.json").then((topology) => {
      const topo = topology as unknown as Topology;
      const countries = topo.objects.countries as GeometryCollection;
      const geo = feature(topo, countries) as FeatureCollection;
      cached = geo;
      return geo;
    });
  }
  return loading;
}
