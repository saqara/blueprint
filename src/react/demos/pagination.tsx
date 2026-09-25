import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/registry/react/ui/pagination"

export default function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#/composants/pagination" /></PaginationItem>
        <PaginationItem><PaginationLink href="#/composants/pagination">1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#/composants/pagination" isActive>2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationNext href="#/composants/pagination" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
