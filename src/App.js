import { useRef, useState } from "react";
import "./App.css";

//FIREBASE SDK
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

//FIREBASE HOOKS
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const config = {
  apiKey: "AIzaSyApQKX0tqJSrX0oz4q52XXPD-bvV2W9X2A",
  authDomain: "big-kaiwa.firebaseapp.com",
  projectId: "big-kaiwa",
  storageBucket: "big-kaiwa.appspot.com",
  messagingSenderId: "597563995585",
  appId: "1:597563995585:web:8b30ac8df1cb4f5fbc2b40",
  measurementId: "G-2G725G8KDF",
};
!firebase.apps.length ? firebase.initializeApp(config) : firebase.app();

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Welcome to the chat room!</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div style={{ justify: "center" }}>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message" />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`} style={{ "align-items": "center" }}>
        <img alt="DP" src={photoURL || "https://via.placeholder.com/150/000000/FFFFFF/?text=User"} />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
