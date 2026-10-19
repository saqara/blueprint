import { Card, CardContent } from "@/registry/react/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/registry/react/ui/carousel"

const sources = ["Rapport annuel 2025", "Fiche Kbis", "Attestation URSSAF", "Avis clients"]

export default function CarouselDemo() {
  return (
    <Carousel className="mx-12 max-w-xs">
      <CarouselContent>
        {sources.map((title) => (
          <CarouselItem key={title}>
            <Card><CardContent className="flex h-32 items-center justify-center text-center font-medium">{title}</CardContent></Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
