import {
  InlineCitation, InlineCitationCard, InlineCitationCardBody, InlineCitationCardTrigger, InlineCitationCarousel,
  InlineCitationCarouselContent, InlineCitationCarouselHeader, InlineCitationCarouselIndex, InlineCitationCarouselItem,
  InlineCitationCarouselNext, InlineCitationCarouselPrev, InlineCitationSource, InlineCitationText,
} from "@/registry/react/ui/inline-citation"

const sources = [
  { url: "https://www.insee.fr/fr/statistiques", title: "Insee", description: "Démographie des entreprises par région." },
  { url: "https://annuaire-entreprises.data.gouv.fr", title: "Annuaire des entreprises", description: "Fiches officielles des entreprises françaises." },
]

export default function InlineCitationDemo() {
  return (
    <p className="max-w-xl text-sm leading-relaxed">
      La région Auvergne-Rhône-Alpes{" "}
      <InlineCitation>
        <InlineCitationText>concentre une part importante des PME industrielles</InlineCitationText>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={sources.map((s) => s.url)} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((s) => (
                  <InlineCitationCarouselItem key={s.url}>
                    <InlineCitationSource title={s.title} url={s.url} description={s.description} />
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>.
    </p>
  )
}
