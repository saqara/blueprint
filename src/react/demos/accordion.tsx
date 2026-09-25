import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/react/ui/accordion"

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="max-w-md">
      <AccordionItem value="legal">
        <AccordionTrigger>Informations légales</AccordionTrigger>
        <AccordionContent>SAS au capital de 50 000 €, créée en 2004.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="finance">
        <AccordionTrigger>Données financières</AccordionTrigger>
        <AccordionContent>CA 2025 : 4,2 M€.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
