export default function GuidePage() {
  return (
    <div className="container-max grid gap-4">
      <h1 className="text-xl font-bold">Course Guide (PT-PT A1)</h1>
      <div className="card p-4 grid gap-2">
        <p>Welcome! This course focuses on European Portuguese. You will learn through flashcards, listening, typing, and spaced repetition.</p>
        <ul className="list-disc pl-6 text-white/80">
          <li>Pronunciation and listening use European voices when available.</li>
          <li>Keyboard helper shows accents: á é í ó ú ã õ â ê ô ç.</li>
          <li>Spaced repetition prioritizes what you find hard.</li>
          <li>Short, dense lessons targeting real situations.</li>
        </ul>
      </div>
    </div>
  );
} 