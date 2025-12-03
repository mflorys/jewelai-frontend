interface PageProps {
  params: { id: string };
}

export default function DebugPage({ params }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Debug odpowiedzi – proces #{params.id}
      </h1>
      <p className="text-sm text-white/60">
        Tu podłączysz endpoint zwracający wszystkie <code>UserAnswer</code> dla procesu.
      </p>
    </div>
  );
}