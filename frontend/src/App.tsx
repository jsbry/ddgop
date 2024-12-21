import { useState } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Content from './components/Content/Content';
import { Greet } from "../wailsjs/go/main/App";
import './App.css'

function App() {
  const [resultText, setResultText] = useState("Please enter your name below 👇");
  const [name, setName] = useState('');
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);


  const [content, setContent] = useState("Containers");

  function greet() {
    Greet(name).then(updateResultText);
  }

  return (
    <div id="App">
      <Header></Header>
      <div className="container-fluid">
        <div className="row">
          <Sidebar content={content} setContent={setContent}></Sidebar>
          <Content content={content}></Content>
        </div>
      </div>
    </div>
  )
}

export default App
