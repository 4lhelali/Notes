import { useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { NewNote } from "./NewNote";
import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./NoteList";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";

export type Note = { id: string } & NoteData;
export type RawNote = { id: string } & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  label: string;
};

const defaultTags: Tag[] = [
  { id: uuidV4(), label: "Work" },
  { id: uuidV4(), label: "Important" },
  { id: uuidV4(), label: "Personal" },
  { id: uuidV4(), label: "Ideas" },
];

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  if (tags.length === 0) {
    setTags(defaultTags);
  }

  const notesWithTags = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
    }));
  }, [notes, tags]);

  // CRUD
  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prev) => [
      ...prev,
      { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
    ]);
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...data, tagIds: tags.map((tag) => tag.id) }
          : note
      )
    );
  }

  function onDeleteNote(id: string) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  function updateTag(id: string, label: string) {
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, label } : tag))
    );
  }

  function deleteTag(id: string) {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  }

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag]);
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header shadow-sm sticky-top">
        <Container className="d-flex justify-content-between align-items-center">
          {/* Logo + Animated Title */}
          <Link
            to="/"
            className="text-decoration-none d-flex align-items-center logo-container"
          >
            <img
              src="/src/assets/favicon.png" // replace with transparent PNG or SVG
              alt="logo"
              width="60"
              height="60"
              className="logo-animate me-3"
            />
            <h1 className="app-title">
              <span className="animated-text">My Notes</span>
            </h1>
          </Link>

          {/* Floating Add Button */}
          <Link to="/new" className="btn btn-fab btn-gradient shadow">
            +
          </Link>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 py-5">
        <Container className="p-4 glass-card">
          <Routes>
            <Route
              path="/"
              element={
                <NoteList
                  notes={notesWithTags}
                  availableTags={tags}
                  onUpdateTag={updateTag}
                  onDeleteTag={deleteTag}
                />
              }
            />
            <Route
              path="/new"
              element={
                <NewNote
                  onSubmit={onCreateNote}
                  onAddTag={addTag}
                  availableTags={tags}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
              <Route index element={<Note onDelete={onDeleteNote} />} />
              <Route
                path="edit"
                element={
                  <EditNote
                    onSubmit={onUpdateNote}
                    onAddTag={addTag}
                    availableTags={tags}
                  />
                }
              />
            </Route>
          </Routes>
        </Container>
      </main>

      {/* Footer */}
      <footer className="footer-wrapper text-center py-4">
        <p className="footer-text">© {new Date().getFullYear()} — My Notes</p>
      </footer>

      {/* Modern Styles */}
      <style>{`
        /* Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@500;600&display=swap');

        body, html, .app-wrapper {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f0f4f8, #d9e2ef);
          min-height: 100vh;
          margin: 0;
        }

        /* Header */
        .app-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 1rem 0;
          border-radius: 0 0 20px 20px;
          animation: fadeIn 1s ease;
        }

        .app-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.6rem;
          margin: 0;
        }

        .logo-container:hover .app-title {
          color: #ffdd57;
        }

        /* Animated Text Gradient */
        .animated-text {
          background: linear-gradient(90deg, #ff7e5f, #feb47b, #667eea, #764ba2);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-slide 4s linear infinite;
        }

        @keyframes gradient-slide {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating Add Button */
        .btn-fab {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.8rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #ff7e5f, #feb47b);
          color: white;
          border: none;
          transition: all 0.4s ease;
        }
        .btn-gradient:hover {
          transform: rotate(-5deg) scale(1.15);
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        }

        /* Glassmorphism Card */
        .glass-card {
          backdrop-filter: blur(15px);
          background: rgba(255,255,255,0.7);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          animation: fadeIn 1s ease;
        }

        /* Inputs & Textareas */
        input.form-control,
        textarea.form-control,
        select.form-select {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          padding: 0.75rem 1rem;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        input.form-control:focus,
        textarea.form-control:focus,
        select.form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
          outline: none;
        }

        /* Buttons */
        .btn-primary {
          border-radius: 50px;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        /* Tags */
        .badge {
          border-radius: 12px;
          padding: 0.4em 0.8em;
          margin-right: 0.3rem;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .badge:hover {
          transform: scale(1.1);
          opacity: 0.85;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }

        /* Footer */
        .footer-wrapper {
          backdrop-filter: blur(15px);
          background: rgba(255,255,255,0.2);
          border-top: 1px solid rgba(255,255,255,0.3);
          border-radius: 15px 15px 0 0;
          margin: 2rem auto 0;
          max-width: 100%;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
          animation: fadeIn 1.5s ease;
        }

        .footer-text {
          font-weight: 500;
          font-size: 0.95rem;
          color: white;
          background: linear-gradient(90deg, #ff7e5f, #feb47b, #667eea, #764ba2);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-slide 4s linear infinite;
          margin: 0;
          transition: all 0.3s ease;
        }
        .footer-text:hover {
          transform: scale(1.05);
        }

        .logo-animate {
          transition: transform 0.4s ease;
        }
        .logo-animate:hover {
          transform: scale(1.15) rotate(-5deg);
        }
      `}</style>
    </div>
  );
}

export default App;
