import { RadarChart } from "@/registry/react/ui/radar-chart"

const data = [
  { axis: "Environnement", entreprise: 15, secteur: 11 },
  { axis: "Social", entreprise: 13, secteur: 12 },
  { axis: "Éthique", entreprise: 17, secteur: 13 },
  { axis: "Achats responsables", entreprise: 9, secteur: 10 },
  { axis: "Gouvernance", entreprise: 14, secteur: 12 },
]

export default function RadarChartDemo() {
  return (
    <RadarChart
      className="w-full max-w-md"
      label="Note RSE de Bâti Sud SAS par pilier, sur 20"
      data={data}
      max={20}
      series={[{ key: "entreprise", label: "Bâti Sud SAS" }, { key: "secteur", label: "Moyenne du secteur" }]}
      valueFormatter={(v) => `${v}/20`}
    />
  )
}
