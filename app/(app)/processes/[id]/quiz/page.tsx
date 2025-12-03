interface PageProps {
  params: { id: string };
}

export default function QuizPage({ params }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Quiz projektowy – proces #{params.id}
      </h1>
      <p className="text-sm text-white/60">
        Tu wyrenderujesz pytania z <code>questionJson</code>.
      </p>
    </div>
  );
}