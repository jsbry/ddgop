import { useEffect, useState, useCallback, useRef } from "react";
import { GoLogsContainer, GoInspectContainer, GoFilesContainer } from "../../../wailsjs/go/main/App";
import { createColumnHelper, useReactTable, flexRender, CellContext, ExpandedState, getCoreRowModel, getExpandedRowModel, Row } from '@tanstack/react-table';
import { FaAngleRight, FaAngleDown, FaRegFile, FaRegFolder, FaQuestion } from "react-icons/fa6";
import JsonView from '@uiw/react-json-view';

function Container(props: { id: string, setID: React.Dispatch<React.SetStateAction<string>> }) {
  const { id, setID } = props;
  const [tab, setTab] = useState<string>("Logs")
  const [logs, setLogs] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string>("");
  const [name, setName] = useState<string>("");
  const logRef = useRef<HTMLPreElement>(null);
  const [autoRefreshLog, setAutoRefreshLog] = useState<boolean>(true);
  const [files, setFiles] = useState<TableCol[]>([]);
  const [filePath, setFilePath] = useState<string>("/");
  const [expanded, setExpanded] = useState<ExpandedState>({})

  useEffect(() => {
    logContainer(logs, id, autoRefreshLog);
    inspectContainer(id);
    filesContainer(id);

    const interval = setInterval(() => {
      if (tab == "Logs") {
        logContainer(logs, id, autoRefreshLog);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, tab, autoRefreshLog]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, logRef]);


  type TableCol = {
    name: string;
    size: string;
    lastModified: string;
    mode: string;
    isDir: boolean;
    subRows?: TableCol[];
    absolutePath: string;
  };

  const columnHelper = createColumnHelper<TableCol>();

  const renderName = useCallback(({ row }: { row: Row<TableCol> }) => {
    const name = row.original.name;
    const isDir = row.original.isDir;
    const absolutePath = row.original.absolutePath;
    const t = absolutePath.split(" ");
    let depth = 0
    if (t.length > 0) {
      const a = t[0].match(/\//g);
      if (a) {
        depth = a.length - (isDir ? 2 : 1);
      }
    }
    const marginLeft = (depth * 10) + "px"


    if (name == "") {
      return (
        <>
          <span {...{
            style: { marginLeft: marginLeft }
          }}></span>
          <span className="is-file">empty</span>
        </>
      );
    }
    if (isDir) {
      if (!row.getCanExpand()) {
        return (
          <>
            <span {...{
              style: { marginLeft: marginLeft }
            }}></span>
            <FaQuestion {...{
              onClick: () => expandedHandler({ files, row }),
              style: { cursor: 'pointer' },
              className: "me-1",
            }}></FaQuestion>
            <FaRegFolder className="me-1"></FaRegFolder>
            {name}
          </>
        );
      }
      return (
        <>
          <span {...{
            style: { marginLeft: marginLeft }
          }}></span>
          {row.getIsExpanded() ? <FaAngleDown {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: 'pointer' },
            className: "me-1",
          }}></FaAngleDown> : <FaAngleRight {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: 'pointer' },
            className: "me-1",
          }}></FaAngleRight>}
          <FaRegFolder className="me-1"></FaRegFolder>
          {name}
        </>
      )
    }
    return (
      <>
        <span {...{
          style: { marginLeft: marginLeft }
        }}></span>
        <FaRegFile {...{
          className: "is-file me-1"
        }}></FaRegFile>
        {name}
      </>
    )
  }, [files]);

  const expandedHandler = useCallback(({ files, row }: { files: TableCol[], row: Row<TableCol> }) => {
    const path = row.original.absolutePath;
    const resultFiles = GoFilesContainer(id, path);
    resultFiles.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      let rows: TableCol[] = [];
      d.Files.forEach((f) => {
        let r: TableCol = {
          name: f.Name,
          size: f.Size,
          lastModified: f.ModifiedAt,
          mode: f.Mode,
          isDir: f.IsDir,
          absolutePath: f.AbsolutePath,
        };
        rows.push(r);
      });
      const newFiles = createSubRows(files, path, rows)
      setFiles(newFiles);
    }).catch((err) => {
      console.log(err)
    });
    // row.getToggleExpandedHandler()();
  }, [files]);

  const createSubRows = (files: TableCol[], path: string, rows: TableCol[]) => {
    let done: boolean = false;
    let newFiles: TableCol[] = [];
    files.some((f) => {
      if (f.absolutePath == path) {
        done = true
        f.subRows = rows;
      }
      if (!done && f.subRows) {
        f.subRows = createSubRows(f.subRows, path, rows);
      }
      newFiles.push(f);
    });

    return newFiles;
  }

  const tableColumnDefs = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: 'Name',
      cell: renderName,
    }),
    columnHelper.accessor((row) => row.size, {
      id: 'size',
      header: 'Size',
    }),
    columnHelper.accessor((row) => row.lastModified, {
      id: 'last-modified',
      header: 'LastModified',
    }),
    columnHelper.accessor((row) => row.mode, {
      id: 'mode',
      header: 'Mode',
    }),
  ];

  const table = useReactTable<TableCol>({
    columns: tableColumnDefs,
    data: files,
    state: {
      expanded,
    },
    getSubRows: (row) => row.subRows,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const logContainer = (logs: string[], id: string, autoRefreshLog: boolean) => {
    if (!autoRefreshLog) {
      return;
    }
    const resultLogs = GoLogsContainer(id);
    resultLogs.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      let rows: string[] = [];
      d.Logs.forEach((log) => {
        rows.push(log);
      });
      if (JSON.stringify(logs) != JSON.stringify(rows)) {
        setLogs(rows);
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const inspectContainer = (id: string) => {
    const resultInspect = GoInspectContainer(id);
    resultInspect.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      setInspect(d.Inspect);

      const v = JSON.parse(d.Inspect);
      if (v.Name) {
        setName(v.Name.slice(1));
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const filesContainer = (id: string) => {
    const resultFiles = GoFilesContainer(id, filePath);
    resultFiles.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      let rows: TableCol[] = [];
      d.Files.forEach((file) => {
        let r: TableCol = {
          name: file.Name,
          size: file.Size,
          lastModified: file.ModifiedAt,
          mode: file.Mode,
          isDir: file.IsDir,
          absolutePath: file.AbsolutePath,
        };
        rows.push(r);
      });
      console.log(rows);
      setExpanded({});
      setFiles(rows);
    }).catch((err) => {
      console.log(err)
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
      <div>
        <div className="table-area table-files overflow-auto mt-2">
          <table className="table table-hover table-responsive-lg table-sm">
            <thead className="sticky-top">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="table-group-divider small">
              {table.getRowModel().rows.map((row, index) => {
                return (
                  <tr key={index}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.column.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }, [table]);

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
