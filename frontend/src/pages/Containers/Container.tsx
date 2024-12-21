import { useEffect, useState, useCallback, useRef } from "react";
import { GoStatsContainer, GoLogsContainer, GoInspectContainer, GoExecContainer, GoFilesContainer, GoStartContainer, GoStopContainer, GoRestartContainer } from "../../../wailsjs/go/main/App";
import { createColumnHelper, useReactTable, flexRender, ExpandedState, getCoreRowModel, getExpandedRowModel, Row } from '@tanstack/react-table';
import { OverlayTrigger } from 'react-bootstrap';
import { FaAngleRight, FaAngleDown, FaRegFile, FaRegFolder, FaQuestion, FaStop, FaPlay, FaArrowRotateRight, FaRegCopy } from "react-icons/fa6";
import JsonView from '@uiw/react-json-view';
import { EventsOn, EventsOff } from '../../../wailsjs/runtime'
import * as h from './helper';

function Container(props: { id: string, setID: React.Dispatch<React.SetStateAction<string>> }) {
  const { id, setID } = props;
  const [tab, setTab] = useState<string>("Logs")
  const [logs, setLogs] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string>("");
  const [name, setName] = useState<string>("");
  const logRef = useRef<HTMLPreElement>(null);
  const [execCmd, setExecCmd] = useState<string>("");
  const [files, setFiles] = useState<TableCol[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [state, setState] = useState<string>("");
  const [inactiveBtn, setInactiveBtn] = useState<boolean>(false);
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy to clipboard");
  const [image, setImage] = useState<string>("");
  const [memUsage, setMemUsage] = useState<string>("--");
  const [cpuPerc, setCPUPerc] = useState<string>("--");
  const [cpuLimit, setCPULimit] = useState<string>("--");

  useEffect(() => {
    execContainer(image);
    inspectContainer(id);
  }, []);

  useEffect(() => {
    statsContainer(id);
    const interval = setInterval(() => {
      statsContainer(id);
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    GoLogsContainer(id);
    EventsOn("log", (line: string) => {
      setLogs((prevLogs) => [...prevLogs, line]);
    });
    return () => {
      EventsOff("log");
    };
  }, [id]);

  useEffect(() => {
    filesContainer(id, state);
  }, [id, state]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, logRef]);

  const statsContainer = (id: string) => {
    const stats = GoStatsContainer(id);
    stats.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      if (d.ContainerStats) {
        setCPUPerc(d.ContainerStats.CPUPerc);
        setCPULimit(d.ContainerStats.CPULimit);
        setMemUsage(d.ContainerStats.MemUsage);
      }
    }).catch((err) => {
      console.log(err);
    });
  };

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
  }, []);

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
      if (v.State && v.State.Status) {
        setState(v.State.Status);
      }
      if (v.Config && v.Config.Image) {
        setImage(v.Config.Image);
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const execContainer = (image: string) => {
    const resultExec = GoExecContainer(image);
    resultExec.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      setExecCmd("docker container exec -it " + id.slice(0, 12) + " " + d.Command);
    }).catch((err) => {
      console.log(err);
    });
  };

  const filesContainer = (id: string, state: string) => {
    if (state != "running") {
      return;
    }
    const resultFiles = GoFilesContainer(id, "/");
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
        <code>{execCmd}</code>
      </div>
    )
  }, [execCmd]);

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

  const startContainer = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoStartContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      inspectContainer(id);
    });
  };

  const stopContainer = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoStopContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      inspectContainer(id);
    });
  };

  const restartContainer = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoRestartContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      inspectContainer(id);
    });
  };

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
          <div className="d-flex">
            <div className="me-auto">
              <span>{id.slice(0, 12)}</span>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={h.renderTooltip({ text: copyTooltip })}>
                <span>
                  <FaRegCopy className="ms-1 btn-icon" onClick={() => h.copyToClipboard(id, setCopyTooltip)}></FaRegCopy>
                </span>
              </OverlayTrigger>
            </div>
            <div className="me-auto">
              <p className="small">
                <strong>CPU Usage: </strong>{cpuPerc} / {cpuLimit}<br />
                <strong>Mem Usage: </strong>{memUsage}
              </p>
            </div>
            <div className="me-2">
              <p className="small">
                <strong>STATUS</strong><br />
                {state}
              </p>
            </div>
            <div className="">
              <div className="input-group">
                <button className="btn btn-primary" disabled={h.isExited(state) || inactiveBtn} onClick={() => stopContainer(id.slice(0, 12))}>
                  <FaStop></FaStop>
                </button>
                <button className="btn btn-primary" disabled={h.isRunning(state) || inactiveBtn} onClick={() => startContainer(id.slice(0, 12))}>
                  <FaPlay></FaPlay>
                </button>
                <button className="btn btn-primary" disabled={inactiveBtn} onClick={() => restartContainer(id.slice(0, 12))}>
                  <FaArrowRotateRight></FaArrowRotateRight>
                </button>
              </div>
            </div>
          </div>
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
