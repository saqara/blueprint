import { describe, expect, it } from "vitest"
import { stepErrors as reactStepErrors } from "../src/examples/react/inscription"
import { stepErrors as vueStepErrors } from "../src/examples/vue/inscription.vue"

const valid = { siren: "552 100 554", name: "Bâti Sud", category: "", logo: [], contactName: "Camille Martin", email: "camille@exemple.fr", phone: "", accepted: false }

describe.each([["react", reactStepErrors], ["vue", vueStepErrors]] as const)("%s inscription validation", (_, stepErrors) => {
  it("accepts a complete step 1 and 2", () => {
    expect(stepErrors(1, valid)).toEqual({})
    expect(stepErrors(2, valid)).toEqual({})
  })
  it("rejects a bad SIREN, a missing name, contact and e-mail", () => {
    expect(stepErrors(1, { ...valid, siren: "12345", name: " " })).toEqual({ siren: "Le SIREN doit contenir 9 chiffres.", name: "La raison sociale est obligatoire." })
    expect(stepErrors(2, { ...valid, contactName: "", email: "camille@" })).toEqual({ contactName: "Le nom du contact est obligatoire.", email: "L'e-mail n'est pas valide." })
  })
})

import * as RA from "../src/examples/react/annuaire"
import * as VA from "../src/examples/vue/annuaire.vue"

describe.each([["react", RA], ["vue", VA]] as const)("%s annuaire logic", (_, A) => {
  const base = { search: "", depts: [] as string[], status: "all" as const, minScore: 0 }
  it("ships ~24 fictitious companies", () => expect(A.COMPANIES.length).toBeGreaterThanOrEqual(24))
  it("filters by name ignoring case and accents", () => {
    const found = A.filterCompanies(A.COMPANIES, { ...base, search: "ELEC RHONE" })
    expect(found.map((c) => c.name)).toEqual(["Élec Rhône"])
  })
  it("filters by departments, status and minimum score (all combined)", () => {
    const found = A.filterCompanies(A.COMPANIES, { search: "", depts: ["69"], status: "qualified", minScore: 15 })
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((c) => c.dept === "69" && c.status === "qualified" && c.score >= 15)).toBe(true)
    expect(A.filterCompanies(A.COMPANIES, { ...base, minScore: 21 })).toEqual([])
  })
  it("sorts text in French order and scores numerically, both directions", () => {
    const byName = A.sortCompanies(A.COMPANIES, [{ id: "name", desc: false }]).map((c) => c.name)
    expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b, "fr")))
    const byScore = A.sortCompanies(A.COMPANIES, [{ id: "score", desc: true }]).map((c) => c.score)
    expect(byScore).toEqual([...byScore].sort((a, b) => b - a))
    expect(A.sortCompanies(A.COMPANIES, [])).toEqual(A.COMPANIES)
  })
  it("paginates with a clamped page", () => {
    const list = A.COMPANIES.slice(0, 20)
    expect(A.paginate(list, 1, 8)).toEqual({ rows: list.slice(0, 8), pageCount: 3, page: 1 })
    expect(A.paginate(list, 3, 8).rows).toEqual(list.slice(16, 20))
    expect(A.paginate(list, 9, 8).page).toBe(3)
    expect(A.paginate([], 1, 8)).toEqual({ rows: [], pageCount: 1, page: 1 })
  })
})
