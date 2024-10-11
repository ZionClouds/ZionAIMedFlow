import { Component, For } from "solid-js"
import { AiOutlineEdit } from "solid-icons/ai"
import { FiSearch } from "solid-icons/fi"
import { IoExpand } from "solid-icons/io"
import Modal from "../Modal"
import { INote } from "../../../interfaces"

interface NotesProps {
  notes: INote[];
  modalNote: INote | null;
  modalTarget: string;
  showmodal: boolean;
  onNoteClick: () => void;
  onOpenModal: () => void
  onCloseModal: () => void;
  onSelectNote: (note: INote) => void
  onSelectTarget: (type: string) => void
  onModalEdit: (note: INote) => void
}

const Notes: Component<NotesProps> = (props) => {
  return (
    <>
      <section class="relative z-10 max-w-[1000px] w-full h-[calc(100vh-65px)] mx-auto p-4">
        <h2 class='mb-4 text-lg font-bold text-center'>Processed Encounters</h2>
        <button class="button button-green" onclick={props.onNoteClick}>Back</button>
        <div class='flex mb-2 items-center relative'>
          <div class="flex-grow"></div>
          <input type="search" class='w-full md:max-w-[300px] outline-none resize-none border rounded-lg text-black p-2 pr-10' />
          <FiSearch class="absolute right-2 top-1/2 -translate-y-1/2" />
        </div>
        <div class="h-[calc(100vh-200px)] overflow-y-scroll">
          <For each={props.notes}>
            {note => <div class='flex flex-col mb-4 bg-white shadow-lg rounded-lg overflow-clip text-sm md:text-base p-6 border'>
              <div class='hidden md:flex bg-[#3D5CAA] text-white space-x-1 md:space-x-2 items-center'>
                <label class='font-semibold p-2 uppercase'>File ID</label>
                <label class='p-2'>{note.file_id}</label>

                <label class='font-semibold p-2'>Date</label>
                <label class='p-2'>{(new Date(note.updated)).toLocaleString()}</label>

                <div class="flex-grow"></div>
                <label class='font-semibold p-2 uppercase'>Status</label>
                <label class='bg-[#A5D499] p-2'>{note.status}</label>
              </div>
              <div class='flex flex-col md:hidden px-2 mt-2 bg-black'>
                <div class='flex space-x-2'>
                  <label class='font-semibold uppercase w-12'>File ID</label>
                  <label class=''>{note.file_id}</label>
                  <div class="flex-grow"></div>
                  <label class='font-semibold uppercase'>Status</label>
                  <label class='bg-[#A5D499]'>{note.status}</label>
                </div>
                <div class='flex items-center space-x-2'>
                  <label class='font-semibold uppercase w-12'>Date</label>
                  <label class=''>{(new Date(note.updated)).toLocaleString()}</label>
                </div>
              </div>

              <div class='flex px-2 items-center mt-2'>
                <label class='font-semibold uppercase'>Transcript</label>
                <button class='px-3' title='expand'
                  onClick={() => {
                    props.onSelectNote(note);
                    props.onSelectTarget('transcription');
                    props.onOpenModal()
                  }}
                ><IoExpand /></button>
                <div class="flex-grow"></div>
              </div>
              <div class='p-2'>
                <textarea rows={4} class='w-full border outline-none resize-none p-1' value={note.transcription} />
              </div>

              <div class='flex px-2 items-center mt-2'>
                <label class='font-semibold uppercase'>Notes</label>
                <button class='px-3' title='expand'
                  onClick={() => {
                    props.onSelectNote(note);
                    props.onSelectTarget('edit');
                    props.onOpenModal()
                  }}
                ><AiOutlineEdit /></button>
                <div class="flex-grow"></div>
              </div>
              <div class='p-2'>
                <textarea rows={4} class='w-full border outline-none resize-none p-1' value={note.updatedNotes} />
              </div>
            </div>}
          </For>
        </div>
      </section>
      {props.showmodal && (
        <Modal
          note={props.modalNote}
          target={props.modalTarget}
          onCloseModal={props.onCloseModal}
          edit={props.onModalEdit}
        />
      )}
    </>
  )
}

export default Notes
