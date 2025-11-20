import React from 'react'
import { useState, useMemo } from 'react'
import { Badge, Button, Card, Col, Form, Modal, Row, Stack } from "react-bootstrap"
import { Link } from "react-router-dom"
import ReactSelect from "react-select"
import { Note, Tag } from './App'
import styles from "./NoteList.module.css"

type EditTagsModalProps = {
  show: boolean,
  availableTags: Tag[],
  handleClose: () => void,
  onDeleteTag: (id: string) => void,
  onUpdateTag: (id: string, label: string) => void
}

type SimplifiedNote = {
  tags: Tag[],
  title: string,
  id: string
}

type NoteListProps = {
  availableTags: Tag[],
  notes: SimplifiedNote[],
  onDeleteTag: (id: string) => void,
  onUpdateTag: (id: string, label: string) => void
}

export function NoteList({ availableTags, notes, onUpdateTag, onDeleteTag }: NoteListProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [title, setTitle] = useState("")
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      return (
        (title === "" || note.title.toLowerCase().includes(title.toLowerCase())) &&
        (selectedTags.length === 0 || selectedTags.every(tag => note.tags.some(noteTag => noteTag.id === tag.id)))
      )
    })
  }, [title, selectedTags, notes])

  return (
    <>
      <Row className='align-items-center mb-4'>
        <Col><h1 className="fw-bold">Notes</h1></Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            <Link to="/new">
              <Button variant="primary" className="shadow-sm">Create</Button>
            </Link>
            <Button onClick={() => setEditTagsModalIsOpen(true)} variant="outline-secondary" className="shadow-sm">
              Edit Tags
            </Button>
          </Stack>
        </Col>
      </Row>

      <Form className="mb-4">
        <Row className="mb-4">
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Group controlId="title">
              <Form.Label className="fw-semibold">Search by Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="tags">
              <Form.Label className="fw-semibold">Filter by Tags</Form.Label>
              <ReactSelect
                value={selectedTags.map(tag => ({ label: tag.label, value: tag.id }))}
                options={availableTags.map(tag => ({ label: tag.label, value: tag.id }))}
                onChange={tags => setSelectedTags(tags.map(tag => ({ label: tag.label, id: tag.value })))}
                isMulti
                styles={{
                  control: (base) => ({ ...base, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: 8 }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#e0f0ff', borderRadius: 6 }),
                  multiValueLabel: (base) => ({ ...base, color: '#007bff', fontWeight: 500 }),
                  multiValueRemove: (base) => ({ ...base, color: '#007bff', ':hover': { backgroundColor: '#007bff', color: 'white', borderRadius: 6 } }),
                  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#f0f8ff' : 'white', color: 'black' })
                }}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <Row xs={1} sm={2} lg={3} xl={4} className='g-4'>
        {filteredNotes.map(note => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>

      <EditTagsModal
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        availableTags={availableTags}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
      />
    </>
  )
}

function NoteCard({ id, title, tags }: SimplifiedNote) {
  return (
    <Card
      as={Link}
      to={`/${id}`}
      className={`h-100 text-reset text-decoration-none ${styles.card}`}
      style={{
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <Card.Body className="d-flex flex-column align-items-center justify-content-center">
        <span className="fs-5 text-center fw-semibold">{title}</span>
        {tags.length > 0 && (
          <Stack gap={1} direction="horizontal" className="justify-content-center flex-wrap mt-2">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                className="text-truncate"
                style={{
                  backgroundColor: '#007bff', // blue background
                  color: '#ffffff',            // white text
                  fontWeight: 500,
                  borderRadius: 6,
                  padding: '0.35em 0.75em',
                }}
              >
                {tag.label}
              </Badge>
            ))}
          </Stack>
        )}
      </Card.Body>
    </Card>
  )
}

function EditTagsModal({ availableTags, show, handleClose, onDeleteTag, onUpdateTag }: EditTagsModalProps) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={2}>
            {availableTags.map(tag => (
              <Row key={tag.id}>
                <Col>
                  <Form.Control
                    type="text"
                    value={tag.label}
                    onChange={e => onUpdateTag(tag.id, e.target.value)}
                    style={{ borderRadius: 6, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    onClick={() => onDeleteTag(tag.id)}
                    variant="outline-danger"
                    style={{ borderRadius: 6 }}
                  >
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
