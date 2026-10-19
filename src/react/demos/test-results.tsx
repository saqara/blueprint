import {
  Test, TestError, TestErrorMessage, TestResults, TestResultsContent, TestResultsDuration, TestResultsHeader, TestResultsProgress,
  TestResultsSummary, TestSuite, TestSuiteContent, TestSuiteName,
} from "@/registry/react/ui/test-results"

export default function TestResultsDemo() {
  return (
    <TestResults className="w-full max-w-2xl" summary={{ passed: 3, failed: 1, skipped: 1, total: 5, duration: 2340 }}>
      <TestResultsHeader>
        <TestResultsSummary />
        <TestResultsDuration />
      </TestResultsHeader>
      <TestResultsContent>
        <TestResultsProgress />
        <TestSuite name="Contrôles qualité des fournisseurs" status="failed" defaultOpen>
          <TestSuiteName />
          <TestSuiteContent>
            <Test name="Aucun SIRET en double" status="passed" duration={412} />
            <Test name="Chaque fournisseur a une ville" status="failed" duration={388} />
            <TestError className="mx-4 mb-2 mt-0">
              <TestErrorMessage>14 fournisseurs sans ville (dont 9 à Lyon d’après le code postal).</TestErrorMessage>
            </TestError>
            <Test name="Notes comprises entre 0 et 5" status="passed" duration={120} />
            <Test name="Dates d’inscription dans le passé" status="passed" duration={96} />
            <Test name="Cohérence avec l’annuaire public" status="skipped" />
          </TestSuiteContent>
        </TestSuite>
      </TestResultsContent>
    </TestResults>
  )
}
