import { useEffect, useState, useCallback, useRef } from "react";
import { GoLogsContainer, GoInspectContainer } from "../../../wailsjs/go/main/App";
import JsonView from '@uiw/react-json-view';

function Container(props: { id: string, setID: React.Dispatch<React.SetStateAction<string>> }) {
  const { id, setID } = props;
  const [tab, setTab] = useState<string>("Logs")
  const [logs, setLogs] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string>("");
  const [name, setName] = useState<string>("");
  const logRef = useRef<HTMLPreElement>(null);
  const [autoReload, setAutoReload] = useState<boolean>(true);

  useEffect(() => {
    detailContainer(logs, id, tab, autoReload);
    inspectContainer(id);

    const interval = setInterval(() => {
      detailContainer(logs, id, tab, autoReload);
    }, 1000);

    return () => clearInterval(interval);
  }, [id, tab, autoReload]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const detailContainer = (logs: string[], id: string, tab: string, autoReload: boolean) => {
    switch (tab) {
      case "Logs":
        if (!autoReload) {
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
    }
  };

  const RenderLogsTab = () => {
    return (
      <>
        <pre className="log-container p-2 bg-light" ref={logRef}>
          <RenderLogs></RenderLogs>
        </pre>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={autoReload} onChange={() => setAutoReload(!autoReload)} />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">auto reload</label>
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
