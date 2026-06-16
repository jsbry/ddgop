import { useEffect, useState } from 'react';
import { GoConfigGet } from "../wailsjs/go/main/App";
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Content from './components/Content/Content';
import './App.css'

function App() {
  const [content, setContent] = useState("Config");

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = () => {
    const result = GoConfigGet();
    result.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      if (d.WithHostType != 0) {
        setContent("Containers");
      }
    }).catch((err) => {
      console.log(err);
    });
  };

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
