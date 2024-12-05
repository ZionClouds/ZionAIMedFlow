import { createEffect, createSignal, onCleanup } from 'solid-js';
import axios from 'axios';
import { Header, Main } from './components';
import { msalInstance } from './auth/authConfig';
import { MsalProvider } from "msal-community-solid";

const BASE_URL = "http://127.0.0.1:8000/"; // replace with the actual base URL

// Auth logic moved into a function
export interface INote {
  pid: string;
  id: string;
  status: string;
  file_id: string;
  file_url: string;
  transcription: string;
  notes: string;
  updatedNotes: string;
  updated: Date;
}

function App() {
  const [authorized, setAuthorized] = createSignal(false);
  const [user, setUser] = createSignal({ name: 'Lightning McQueen, MD', id: 'jmdoe', email: 'jmdoe@mdpartners.com' });
  const [file, setFile] = createSignal<File | null>(null);
  const [uploading, setUploading] = createSignal(false);
  const [notes, setNotes] = createSignal<INote[]>([]);
  const [showmodal, setShowModal] = createSignal(false);
  const [selectedNote, setSelectedNote] = createSignal<INote | null>(null);
  const [selectedTarget, setSelectedTarget] = createSignal('transcription');

  // Run authentication and handle redirect response on component mount
  const authenticateUser = async () => {
    const loginRequest = {
      scopes: ["user.read"], // optional Array<string>
    };
  
    try {
      // First, wait for the previous interaction to complete
      await msalInstance.handleRedirectPromise();
  
      // Check if accounts are available (i.e., user is signed in)
      const accounts = msalInstance.getAllAccounts();
      //console.log(accounts[0]['name']);
      if (accounts.length === 0) {
        // If no accounts are found, initiate the loginRedirect flow
        await msalInstance.loginRedirect(loginRequest);
      }
      const account = accounts[0]; // Assuming the first account is the active user
      setUser({ name: String(account.name), id: 'ygundela', email: String(account.username) });
      setAuthorized(true);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  
  // Function to handle the redirect response after the page reloads
  const handleRedirectResponse = async () => {
    try {
      const loginResponse = await msalInstance.handleRedirectPromise();
      if (loginResponse) {
        console.log("Access token:", loginResponse.accessToken);
      }
    } catch (error) {
      console.error("Error handling redirect:", error);
    }
  };

  createEffect(() => {
    
    const initiateAuth = async () => {
      // Handle the redirect response after page reload
      await handleRedirectResponse();

      // Initiate login redirect if needed
      await authenticateUser();
    };


    initiateAuth();

  });

  const uploadFile = async (file: File) => {
    if (uploading()) return;

    if (!file) {
      alert('No file was selected for upload');
      return;
    }

    setUploading(true);
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
    } finally {
      setFile(null);
      setUploading(false);
    }
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files !== null && input.files.length > 0) {
      const file = input.files[0];
      console.log('test file change', input.files);
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (file()) {
      await uploadFile(file()!);
    }
  };

  const updateNotes = async () => {
    try {
      const response = await axios.get<INote[]>(BASE_URL + 'notes/' + user().id);
      const data = response.data;
      setNotes(data);
      console.log('Notes updated:', response.data);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  createEffect(() => {
    const interval = setInterval(async () => {
      await updateNotes();
    }, 2000);

    onCleanup(() => {
      clearInterval(interval); // Clear the interval when the component is destroyed
    });
  });

  const edit = async (note: INote) => {
    try {
      await axios.post(BASE_URL + 'notes', note);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setShowModal(false);
    }
  };

  const handleOpenModal = (): void => {
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  const handleSelectNote = (note: INote): void => {
    setSelectedNote(note);
  };

  const handleSelectTarget = (type: string): void => {
    setSelectedTarget(type);
  };

  return (
    <>
      <MsalProvider instance={msalInstance}>
        <Header user={user().name} auth= {authorized()} />
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
      </MsalProvider>
    </>
  );
}

export default App;


// import { createEffect, createSignal, onCleanup } from 'solid-js';
// import axios from 'axios';
// import { Header, Main } from './components';
// import { msalInstance } from './auth/authConfig';
// import { MsalProvider } from "msal-community-solid";

// const BASE_URL = "http://127.0.0.1:8000/"; // replace with the actual base URL

// // Auth logic moved into a function
// const authenticateUser = async () => {
//   const loginRequest = {
//     scopes: ["user.read"], // optional Array<string>
//   };

//   try {
//     // Use loginRedirect instead of loginPopup
//     await msalInstance.loginRedirect(loginRequest);
//   } catch (err) {
//     console.error("Login failed:", err);
//   }
// };

// // Function to handle the redirect response after the page reloads
// const handleRedirectResponse = async () => {
//   try {
//     const loginResponse = await msalInstance.handleRedirectPromise();
//     if (loginResponse) {
//       console.log("Access token:", loginResponse.accessToken);
//     }
//   } catch (error) {
//     console.error("Error handling redirect:", error);
//   }
// };

// export interface INote {
//   pid: string;
//   id: string;
//   status: string;
//   file_id: string;
//   file_url: string;
//   transcription: string;
//   notes: string;
//   updatedNotes: string;
//   updated: Date;
// }

// function App() {
//   const [authorized] = createSignal(true);
//   const [user] = createSignal({ name: 'Jane Marie Doe, MD', id: 'jmdoe', email: 'jmdoe@mdpartners.com' });
//   const [file, setFile] = createSignal<File | null>(null);
//   const [uploading, setUploading] = createSignal(false);
//   const [notes, setNotes] = createSignal<INote[]>([]);
//   const [showmodal, setShowModal] = createSignal(false);
//   const [selectedNote, setSelectedNote] = createSignal<INote | null>(null);
//   const [selectedTarget, setSelectedTarget] = createSignal('transcription');

//   // Run authentication and handle redirect response on component mount
//   createEffect(() => {
//     // Handle the redirect response after page reload
//     handleRedirectResponse();

//     // Initiate login redirect if needed
//     authenticateUser();
//   });

//   const uploadFile = async (file: File) => {
//     if (uploading()) return;

//     if (!file) {
//       alert('No file was selected for upload');
//       return;
//     }

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post(BASE_URL + 'upload/' + user().id, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log('File uploaded successfully:', response.data);
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     } finally {
//       setFile(null);
//       setUploading(false);
//     }
//   };

//   const handleFileChange = (event: Event) => {
//     const input = event.target as HTMLInputElement;
//     if (input.files !== null && input.files.length > 0) {
//       const file = input.files[0];
//       console.log('test file change', input.files);
//       setFile(file);
//     }
//   };

//   const handleUpload = async () => {
//     if (file()) {
//       await uploadFile(file()!);
//     }
//   };

//   const updateNotes = async () => {
//     try {
//       const response = await axios.get<INote[]>(BASE_URL + 'notes/' + user().id);
//       const data = response.data;
//       setNotes(data);
//       console.log('Notes updated:', response.data);
//     } catch (error) {
//       console.error('Error updating notes:', error);
//     }
//   };

//   createEffect(() => {
//     const interval = setInterval(async () => {
//       await updateNotes();
//     }, 2000);

//     onCleanup(() => {
//       clearInterval(interval); // Clear the interval when the component is destroyed
//     });
//   });

//   const edit = async (note: INote) => {
//     try {
//       await axios.post(BASE_URL + 'notes', note);
//     } catch (error) {
//       console.error('Error updating notes:', error);
//     } finally {
//       setShowModal(false);
//     }
//   };

//   const handleOpenModal = (): void => {
//     setShowModal(true);
//   };

//   const handleCloseModal = (): void => {
//     setShowModal(false);
//   };

//   const handleSelectNote = (note: INote): void => {
//     setSelectedNote(note);
//   };

//   const handleSelectTarget = (type: string): void => {
//     setSelectedTarget(type);
//   };

//   return (
//     <>
//       <MsalProvider instance={msalInstance}>
//         <Header authorized={authorized()} />
//         <Main
//           file={file()}
//           isUploading={uploading()}
//           showmodal={showmodal()}
//           onUpload={handleUpload}
//           onFileChange={handleFileChange}
//           notes={notes()}
//           modalNote={selectedNote()}
//           onOpenModal={handleOpenModal}
//           onCloseModal={handleCloseModal}
//           modalEdit={edit}
//           modalTarget={selectedTarget()}
//           onSelectNote={handleSelectNote}
//           onSelectTarget={handleSelectTarget}
//         />
//       </MsalProvider>
//     </>
//   );
// }

// export default App;







// import { createEffect, createSignal } from 'solid-js'
// import axios from 'axios'
// import { Header, Main } from './components'
// import {msalInstance} from './auth/authConfig'
// import { MsalProvider } from "msal-community-solid";

// const BASE_URL = "http://127.0.0.1:8000/"//import.meta.env.VITE_BASE_URL as string

// //AUTH CODE
// var loginRequest = {
//   scopes: ["user.read"], // optional Array<string>
// };

// try {
//   const loginResponse = await msalInstance.loginPopup(loginRequest);
//   if (loginResponse){
//     print(loginResponse.accessToken)
//   }
// } catch (err) {
//   // handle error
// }

// export interface INote {
//   pid: string
//   id: string
//   status: string
//   file_id: string
//   file_url: string
//   transcription: string
//   notes: string
//   updatedNotes: string
//   updated: Date
// }

// function App() {
//   const [authorized] = createSignal(true)
//   const [user] = createSignal({ name: 'Jane Marie Doe, MD', id: 'jmdoe', email: 'jmdoe@mdpartners.com' })
//   const [file, setFile] = createSignal<File | null>(null)
//   const [uploading, setUploading] = createSignal(false)
//   const [notes, setNotes] = createSignal<INote[]>([])
//   const [showmodal, setShowModal] = createSignal(false)
//   const [selectedNote, setSelectedNote] = createSignal<INote | null>(null)
//   const [selectedTarget, setSelectedTarget] = createSignal('transcription')

//   const uploadFile = async (file: File) => {
//     if (uploading())
//       return

//     if (!file) {
//       alert('No file was selected for upload')
//       return
//     }

//     setUploading(true)
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post(BASE_URL + 'upload/' + user().id, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log('File uploaded successfully:', response.data);
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     }
//     finally {
//       setFile(null)
//       setUploading(false)
//     }
//   }

//   const handleFileChange = (event: Event) => {
//     const input = event.target as HTMLInputElement;
//     if (input.files !== null && input.files.length > 0) {
//       const file = input.files[0];
//       console.log('test file change', input.files)
//       //alert('File changed')
//       setFile(file)
//     }
//   }

//   const handleUpload = async () => {
//     if (file()) {
//       await uploadFile(file()!)
//     }
//   }

//   const updateNotes = async () => {
//     try {
//       const response = await axios.get<INote[]>(BASE_URL + 'notes/' + user().id);
//       const data = response.data;
//       setNotes(data)
//       console.log('Notes updated:', response.data);
//     } catch (error) {
//       console.error('Error updating notes:', error);
//     }
//   }

//   createEffect(() => {
//     const interval = setInterval(async () => {
//       await updateNotes();
//     }, 2000);

//     return () => clearInterval(interval);
//   });

//   const edit = async (note: INote) => {
//     try {
//       await axios.post(BASE_URL + 'notes', note);
//     }
//     catch (error) {
//       console.error('Error updating notes:', error);
//     }
//     finally {
//       setShowModal(false)
//     }
//   }

//   const handleOpenModal = (): void => {
//     setShowModal(true)
//   }

//   const handleCloseModal = (): void => {
//     setShowModal(false)
//   }

//   const handleSelectNote = (note: INote): void => {
//     setSelectedNote(note)
//   }

//   const handleSelectTarget = (type: string): void => {
//     setSelectedTarget(type)
//   }

//   return (
//     <>
//     <MsalProvider instance={msalInstance}>
//       <Header
//         authorized={authorized()}
//       />
//       <Main
//         file={file()} 
//         isUploading={uploading()}
//         showmodal={showmodal()}
//         onUpload={handleUpload}
//         onFileChange={handleFileChange}
//         notes={notes()}
//         modalNote={selectedNote()}
//         onOpenModal={handleOpenModal}
//         onCloseModal={handleCloseModal}
//         modalEdit={edit}
//         modalTarget={selectedTarget()}
//         onSelectNote={handleSelectNote}
//         onSelectTarget={handleSelectTarget}
//       />
//       </MsalProvider>
//     </>
//   )
// }

// export default App