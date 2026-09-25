import { Button } from "@/registry/react/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/react/ui/card"

export default function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Bâti Sud SAS</CardTitle>
        <CardDescription>SIREN 900 000 001 — Lyon</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">Note qualité : 16/20</CardContent>
      <CardFooter><Button size="sm">Voir la fiche</Button></CardFooter>
    </Card>
  )
}
