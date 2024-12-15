import { useEffect, useState, useCallback, useRef } from "react";
import { GoLogsContainer, GoInspectContainer, GoFilesContainer } from "../../../wailsjs/go/main/App";
import JsonView from '@uiw/react-json-view';

function Container(props: { id: string, setID: React.Dispatch<React.SetStateAction<string>> }) {
  const { id, setID } = props;
  const [tab, setTab] = useState<string>("Logs")
  const [logs, setLogs] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string>("");
  const [name, setName] = useState<string>("");
  const logRef = useRef<HTMLPreElement>(null);
  const [autoRefreshLog, setAutoRefreshLog] = useState<boolean>(true);
  const [files, setFiles] = useState<string>("");

  useEffect(() => {
    detailContainer(logs, id, tab, autoRefreshLog);
    inspectContainer(id);

    const interval = setInterval(() => {
      detailContainer(logs, id, tab, autoRefreshLog);
    }, 1000);

    return () => clearInterval(interval);
  }, [id, tab, autoRefreshLog]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const detailContainer = (logs: string[], id: string, tab: string, autoRefreshLog: boolean) => {
    switch (tab) {
      case "Logs":
        if (!autoRefreshLog) {
          return;
        }
        const resultLogs = GoLogsContainer(id);
        resultLogs.then((d) => {
          console.log(d);
          if (d.error != null) {
            throw new Error(d.error);
          }
          let rows: string[] = [];
          d.logs.forEach((log) => {
            rows.push(log);
          });
          if (JSON.stringify(logs) != JSON.stringify(rows)) {
            setLogs(rows);
          }
        }).catch((err) => {
          console.log(err);
        });
        break;
      case "Files":
        const resultFiles = GoFilesContainer(id);
        resultFiles.then((d) => {
          console.log(d);
          if (d.error != null) {
            throw new Error(d.error);
          }
          setFiles(d.files);
        }).catch((err) => {
          console.log(err)
        })
    }
  };

  const inspectContainer = (id: string) => {
    const resultInspect = GoInspectContainer(id);
    resultInspect.then((d) => {
      console.log(d);
      if (d.error != null) {
        throw new Error(d.error);
      }
      setInspect(d.inspect);

      const v = JSON.parse(d.inspect);
      if (v.Name) {
        setName(v.Name.slice(1));
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const resetDetail = () => {
    setID("");
    setTab("");
  };

  const renderTab = (tab: string) => {
    switch (tab) {
      case "Logs":
        return <RenderLogsTab></RenderLogsTab>
      case "Inspect":
        return <RenderInspectTab></RenderInspectTab>
      case "Exec":
        return <RenderExecTab></RenderExecTab>
      case "Files":
        return <RenderFilesTab></RenderFilesTab>
    }
  };

  const RenderLogsTab = () => {
    return (
      <>
        <pre className="log-container p-2 bg-light" ref={logRef}>
          <RenderLogs></RenderLogs>
        </pre>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={autoRefreshLog} onChange={() => setAutoRefreshLog(!autoRefreshLog)} />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">auto refresh</label>
        </div>
      </>
    )
  };

  const RenderLogs = useCallback(() => {
    return (
      <>
        {logs.join("\n")}
      </>
    )
  }, [logs])

  const RenderInspectTab = useCallback(() => {
    inspectContainer(id);
    if (inspect == "") {
      return <></>
    }
    const v = JSON.parse(inspect);
    return (
      <div className="log-container p-2 bg-light">
        <JsonView value={v} displayDataTypes={false}></JsonView>
      </div>
    )
  }, [inspect]);

  const RenderExecTab = useCallback(() => {
    return (
      <div className="p-2 bg-light">
        <code>docker exec -it {id.slice(0, 12)} /bin/bash</code>
      </div>
    )
  }, []);

  const RenderFilesTab = useCallback(() => {
    return (
      <div className="log-container p-2 bg-light">
        <p>{files}</p>
      </div>
    )
  }, [files]);

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#" onClick={() => resetDetail()}>Containers</a></li>
              <li className="breadcrumb-item active" aria-current="page">{name}</li>
            </ol>
          </nav>
        </div>

        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className={`nav-link ${tab == "Logs" ? "active" : ""}`} href="#" onClick={() => setTab("Logs")}>Logs</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${tab == "Inspect" ? "active" : ""}`} href="#" onClick={() => setTab("Inspect")}>Inspect</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${tab == "Exec" ? "active" : ""}`} href="#" onClick={() => setTab("Exec")}>Exec</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${tab == "Files" ? "active" : ""}`} href="#" onClick={() => setTab("Files")}>Files</a>
            </li>
          </ul>
        </div>

        <div className="col-12">
          {renderTab(tab)}
        </div>
      </div>
    </div>
  )
}

export default Container
