import { useEffect, useState, useCallback, useRef } from "react";
import { GoLogsContainer, GoInspectContainer, GoFilesContainer } from "../../../wailsjs/go/main/App";
import { createColumnHelper, useReactTable, flexRender, CellContext, ExpandedState, getCoreRowModel, getExpandedRowModel, Row } from '@tanstack/react-table';
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
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
  const [expanded, setExpanded] = useState<ExpandedState>({})

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


  type TableCol = {
    name: string;
    size: string;
    lastModified: string;
    mode: string;
    subRows?: TableCol[];
  };

  const columnHelper = createColumnHelper<TableCol>();

  const renderName = useCallback(({ row }: { row: Row<TableCol> }) => {
    const name = row.original.name;
    if (row.getCanExpand()) {
      return (
        <>
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: 'pointer' },
            }}
          >
            {row.getIsExpanded() ? <FaAngleDown></FaAngleDown> : <FaAngleRight></FaAngleRight>}
          </button>
          {name}
        </>
      )
    }
    return <>{name}</>
  }, []);

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
        const d: TableCol[] = [
          { name: "aa0", mode: "mode0", lastModified: "lastModified0", size: "size0" },
          { name: "aa1", mode: "mode1", lastModified: "lastModified1", size: "size1"},
          { name: "aa2", mode: "mode2", lastModified: "lastModified2", size: "size2", subRows: [{ name: "aa3", mode: "mode3", lastModified: "lastModified3", size: "size3"}]},
        ];
        setFiles(d);
      // const resultFiles = GoFilesContainer(id);
      // resultFiles.then((d) => {
      //   console.log(d);
      //   if (d.error != null) {
      //     throw new Error(d.error);
      //   }
      //   setFiles(d.files);
      // }).catch((err) => {
      //   console.log(err)
      // });
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
      <div className="table-area table-containers overflow-auto pt-2">
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
