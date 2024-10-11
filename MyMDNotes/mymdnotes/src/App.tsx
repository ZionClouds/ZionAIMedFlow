import { createEffect, createSignal } from 'solid-js'
import axios from 'axios'
import { Header, Main } from './components'

const BASE_URL = import.meta.env.VITE_BASE_URL as string

export interface INote {
  pid: string
  id: string
  status: string
  file_id: string
  file_url: string
  transcription: string
  notes: string
  updatedNotes: string
  updated: Date
}

function App() {
  const [authorized] = createSignal(true)
  const [user] = createSignal({ name: 'Jane Marie Doe, MD', id: 'jmdoe', email: 'jmdoe@mdpartners.com' })
  const [file, setFile] = createSignal<File | null>(null)
  const [uploading, setUploading] = createSignal(false)
  const [notes, setNotes] = createSignal<INote[]>([])
  const [showmodal, setShowModal] = createSignal(false)
  const [selectedNote, setSelectedNote] = createSignal<INote | null>(null)
  const [selectedTarget, setSelectedTarget] = createSignal('transcription')

  const uploadFile = async (file: File) => {
    if (uploading())
      return

    if (!file) {
      alert('No file was selected for upload')
      return
    }

    setUploading(true)
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(BASE_URL + 'upload/' + user().id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    finally {
      setFile(null)
      setUploading(false)
    }
  }

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files !== null && input.files.length > 0) {
      const file = input.files[0];
      console.log('test file change', input.files)
      //alert('File changed')
      setFile(file)
    }
  }

  const handleUpload = async () => {
    if (file()) {
      await uploadFile(file()!)
    }
  }

  const updateNotes = async () => {
    try {
      const response = await axios.get<INote[]>(BASE_URL + 'notes/' + user().id);
      const data = response.data;
      setNotes(data)
      console.log('Notes updated:', response.data);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }

  createEffect(() => {
    const interval = setInterval(async () => {
      await updateNotes();
    }, 2000);

    return () => clearInterval(interval);
  });

  const edit = async (note: INote) => {
    try {
      await axios.post(BASE_URL + 'notes', note);
    }
    catch (error) {
      console.error('Error updating notes:', error);
    }
    finally {
      setShowModal(false)
    }
  }

  const handleOpenModal = (): void => {
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
  }

  const handleSelectNote = (note: INote): void => {
    setSelectedNote(note)
  }

  const handleSelectTarget = (type: string): void => {
    setSelectedTarget(type)
  }

  return (
    <>
      <Header
        authorized={authorized()}
      />
      <Main
        file={file()} 
        isUploading={uploading()}
        showmodal={showmodal()}
        onUpload={handleUpload}
        onFileChange={handleFileChange}
        notes={notes()}
        modalNote={selectedNote()}
        onOpenModal={handleOpenModal}
        onCloseModal={handleCloseModal}
        modalEdit={edit}
        modalTarget={selectedTarget()}
        onSelectNote={handleSelectNote}
        onSelectTarget={handleSelectTarget}
      />
    </>
  )
}

export default App
