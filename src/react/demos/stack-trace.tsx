import {
  StackTrace, StackTraceActions, StackTraceContent, StackTraceCopyButton, StackTraceError, StackTraceErrorMessage, StackTraceErrorType,
  StackTraceExpandButton, StackTraceFrames, StackTraceHeader,
} from "@/registry/react/ui/stack-trace"

const trace = `BigQueryError: Unrecognized name: villes at [3:8]
    at QueryJob.getQueryResults (/app/node_modules/@google-cloud/bigquery/build/src/job.js:412:21)
    at async ChatController.runQuery (/app/app/controllers/chat_controller.ts:88:19)
    at async processTicksAndRejections (node:internal/process/task_queues:95:5)`

export default function StackTraceDemo() {
  return (
    <StackTrace className="w-full max-w-2xl" trace={trace} defaultOpen>
      <StackTraceHeader>
        <StackTraceError>
          <StackTraceErrorType />
          <StackTraceErrorMessage />
        </StackTraceError>
        <StackTraceActions>
          <StackTraceCopyButton />
          <StackTraceExpandButton />
        </StackTraceActions>
      </StackTraceHeader>
      <StackTraceContent>
        <StackTraceFrames />
      </StackTraceContent>
    </StackTrace>
  )
}
