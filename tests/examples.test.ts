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
