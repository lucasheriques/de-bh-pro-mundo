/** A slide's speaker notes: the points to make, one per line. */
export function NoteList({ notes, className }: { notes: readonly string[]; className: string }) {
  return (
    <ul className={`note-list ${className}`}>
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}
