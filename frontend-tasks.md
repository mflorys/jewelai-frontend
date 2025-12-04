Please update the Next.js frontend to support:

1. A "Delete project" button on the project details page
2. A "Generate design" button that triggers backend image generation (prompt + DALL-E) for eligible projects

Tech context:

- Next.js (App Router)
- TypeScript + React
- We already have:
  - an authenticated area with a project list ("dashboard")
  - a project details page that shows a single design process (status, title, etc.)
  - a backend with endpoints:
    - DELETE /api/processes/{id} (soft delete; only for owner)
    - GET /api/processes/{id} (details)
    - GET /api/processes/{id}/prompt (returns { "prompt": "..." })
    - POST /api/processes/{id}/start-generation (triggers prompt + DALL-E image generation on backend)
- Status enum on backend (string values):
  - INTAKE_IN_PROGRESS
  - READY_FOR_GENERATION
  - GENERATION_REQUESTED
  - VISUAL_READY
  - CLIENT_ACCEPTED
  - SENT_TO_REVIEW
  - APPROVED_FOR_PRODUCTION
  - IN_PRODUCTION
  - CRAFTED
  - SHIPPING
  - IN_DELIVERY
  - COMPLETED
  - RETURN_IN_PROGRESS

We must:

- Respect these statuses when deciding which buttons to show/enable.
- Always enforce that the user can only manipulate their own projects (the backend already checks ownership; frontend should just use the existing auth mechanism: attach token/cookies as is done elsewhere).

==================================================

1. # DELETE PROJECT BUTTON ON DETAILS PAGE

Goal:

- On the project details screen, show a "Delete project" button ONLY for processes with status up to and including CLIENT_ACCEPTED:
  - allowed statuses:
    - INTAKE_IN_PROGRESS
    - READY_FOR_GENERATION
    - GENERATION_REQUESTED
    - VISUAL_READY
    - CLIENT_ACCEPTED
- For all later statuses (SENT_TO_REVIEW and beyond), do NOT show the delete button.

Implementation details:

1. Find the project details page component.

   - Most likely something like: app/processes/[id]/page.tsx
   - Or a child component used there, e.g. <ProcessDetails />.

2. Ensure that the process data loaded for the page includes:

   - id
   - status
   - title (or name)
   - any other fields you already use

3. Add a helper to check if deletion is allowed:

   const DELETABLE_STATUSES = [
   "INTAKE_IN_PROGRESS",
   "READY_FOR_GENERATION",
   "GENERATION_REQUESTED",
   "VISUAL_READY",
   "CLIENT_ACCEPTED",
   ] as const;

   const canDeleteProcess = (status: string) =>
   DELETABLE_STATUSES.includes(status as any);

4. In the JSX for the details view:

   - If canDeleteProcess(process.status) === true, render a secondary/danger button, e.g.:

   <Button
   variant="destructive"
   size="sm"
   onClick={handleDelete}
   disabled={isDeleting}

   > {isDeleting ? "Deleting..." : "Delete project"}
   > </Button>

5. Implement `handleDelete`:

   - Show a confirmation dialog (native confirm() is OK for now):
     if (!window.confirm("Are you sure you want to delete this project? This cannot be undone in the UI.")) return;

   - Call the backend:

     const res = await fetch(`/api/processes/${process.id}`, {
     method: "DELETE",
     headers: {
     "Content-Type": "application/json",
     // Include auth headers / cookies as done elsewhere in the app.
     },
     credentials: "include", // if we use cookies
     });

   - If res.ok:

     - Option A: redirect to the projects list page (e.g. `/dashboard` or `/projects`).
       - Use next/navigation:
         const router = useRouter();
         router.push("/projects"); // or the correct path
         router.refresh();
     - Optionally show a toast: "Project deleted".

   - If !res.ok:
     - Parse error if possible and show a toast or inline error:
       - "Failed to delete project. Please try again."

6. If the backend returns 404 / 403, treat it the same as a generic error on frontend.
   - Ownership & status constraints are handled by the backend; frontend just surfaces the error.

================================================== 2) "GENERATE DESIGN" BUTTON (PROMPT + DALL-E)
==================================================

Goal:

- On the project details screen, show a primary button that:
  - for eligible statuses, triggers the backend to:
    - build the prompt based on answers
    - call DALL-E
    - update the process status to GENERATION_REQUESTED (or as defined on backend)
- This is primarily backend work. The frontend only calls the endpoint and updates UI state.

Eligibility rules for the button:

- The button should be visible when:
  - status === "READY_FOR_GENERATION"
- For other statuses:
  - INTAKE_IN_PROGRESS: show button disabled with a tooltip/label like "Answer all questions first" OR do not show at all (up to you, but READY_FOR_GENERATION should be the ONLY active case).
  - GENERATION_REQUESTED or later: hide or disable the button; design something simple & consistent.

Implementation details:

1.  On the same project details page, add:

    const canGenerate = process.status === "READY_FOR_GENERATION";

2.  Render the button in the main action area:

    {canGenerate && (
    <Button
    variant="default"
    size="sm"
    onClick={handleGenerate}
    disabled={isGenerating}

    >

        {isGenerating ? "Generating..." : "Generate design"}

      </Button>
    )}

3.  Implement `handleGenerate`:

    - Optionally, we can first preview the prompt (using GET /api/processes/{id}/prompt), but for now we can just trigger the generation.
    - Basic implementation:

    async function handleGenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
    const res = await fetch(`/api/processes/${process.id}/start-generation`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    // include auth as used elsewhere
    },
    credentials: "include",
    });

        if (!res.ok) {
          // read error if possible
          // show toast "Failed to start generation"
          throw new Error("Failed to start generation");
        }

        // After successful call, we want to:
        // - either optimistic update status to "GENERATION_REQUESTED"
        // - OR refetch the process details.
        //
        // Preferred: refetch using whatever data fetching method we use here
        // (SWR / React Query / server components with router.refresh()).

        // Example with router.refresh():
        router.refresh();

        // Optional toast:
        // toast.success("Generation started");

    } catch (error) {
    console.error(error);
    // toast.error("Failed to start generation. Please try again.");
    } finally {
    setIsGenerating(false);
    }
    }

4.  If you want to use the `/api/processes/{id}/prompt` endpoint for debugging / QA:

    - Add a small "Preview prompt" button next to "Generate design":

      <Button
      variant="outline"
      size="sm"
      onClick={handlePreviewPrompt}
      disabled={isLoadingPrompt}

      > {isLoadingPrompt ? "Loading..." : "Preview prompt"}
      > </Button>

    - Implement:

      async function handlePreviewPrompt() {
      setIsLoadingPrompt(true);
      try {
      const res = await fetch(`/api/processes/${process.id}/prompt`, {
      method: "GET",
      headers: {
      "Content-Type": "application/json",
      },
      credentials: "include",
      });

          if (!res.ok) throw new Error("Failed to load prompt");

          const data = await res.json(); // { prompt: string }
          setPromptModalContent(data.prompt);
          setIsPromptModalOpen(true);

      } finally {
      setIsLoadingPrompt(false);
      }
      }

    - Show the prompt in a simple modal or <pre> block as read-only text.

================================================== 3) GENERAL NOTES
==================================================

- Use existing UI components (Button, Card, etc.) to keep style consistent.
- Respect current layout of the details page:
  - main actions (Generate, Delete) should be grouped together (e.g. top-right or bottom of the card).
- Handle loading states and errors gracefully (spinners / disabling buttons).
- Do not introduce new global state libraries; reuse whatever is already used in the project (SWR / React Query / simple fetch in server components + router.refresh()).
- Keep all new code strongly typed (TypeScript) and ensure it compiles without errors.
