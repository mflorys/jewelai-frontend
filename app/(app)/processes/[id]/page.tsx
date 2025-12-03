interface PageProps {
  params: { id: string };
}

export default function ProcessDetailPage({ params }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Szczegóły procesu #{params.id}
      </h1>
      <p className="text-sm text-white/60">
        Tu będzie widok procesu, statusy oraz karty: Quiz + Wizualizacja.
      </p>
    </div>
  );
}