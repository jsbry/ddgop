import { useState } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Content from './components/Content/Content';
import './App.css'

function App() {
  const [content, setContent] = useState("Containers");

  return (
    <div id="App">
      <Header content={content} setContent={setContent}></Header>
      <div className="container-fluid">
        <div className="row">
          <Sidebar content={content} setContent={setContent}></Sidebar>
          <Content content={content} setContent={setContent}></Content>
        </div>
      </div>
    </div>
  )
}

export default App
