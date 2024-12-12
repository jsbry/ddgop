import { useEffect, useState, useCallback } from "react";
import { GoLogsContainer, GoInspectContainer } from "../../../wailsjs/go/main/App";

function Container(props: { id: string, setID: React.Dispatch<React.SetStateAction<string>> }) {
  const { id, setID } = props;
  const [tab, setTab] = useState<string>("Logs")
  const [logs, setLogs] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string>("");

  useEffect(() => {
    detailContainer();

    const interval = setInterval(() => {
      detailContainer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const detailContainer = () => {
    switch (tab) {
      case "Logs":
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
          setLogs(rows);
        }).catch((err) => {
          console.log(err);
        });
        break;

      case "Inspect":
        const resultInspect = GoInspectContainer(id);
        resultInspect.then((d) => {
          console.log(d);
          if (d.error != null) {
            throw new Error(d.error);
          }
          setInspect(d.inspect);
        }).catch((err) => {
          console.log(err);
        });
        break;
    }
  };

  const renderTab = (tab: string) => {
    switch (tab) {
      case "Logs":
        return <RenderLogs></RenderLogs>
      case "Inspect":
        return <RenderInspect></RenderInspect>
    }
  };

  const RenderLogs = useCallback(() => {
    return (
      <pre className="log-container p-2 bg-light">
        {logs.join("\n")}
      </pre>
    )
  }, []);

  const RenderInspect = useCallback(() => {
    return (
      <pre className="log-container p-2 bg-light">
        {inspect}
      </pre>
    )
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#" onClick={() => setID("")}>Containers</a></li>
              <li className="breadcrumb-item active" aria-current="page">{ }</li>
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
