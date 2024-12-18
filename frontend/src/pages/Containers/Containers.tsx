import { useEffect, useState, useCallback } from 'react';
import { GoContainers, GoStatsContainer, GoStartContainer, GoUnpauseContainer, GoStopContainer, GoPauseContainer, GoDeleteContainer, GoRestartContainer } from "../../../wailsjs/go/main/App";
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender, CellContext } from '@tanstack/react-table';
import { FaCircle, FaRegCopy, FaPlay, FaStop, FaEllipsisVertical, FaRegTrashCan, FaEye, FaPause, FaArrowRotateRight } from "react-icons/fa6";
import { OverlayTrigger, Tooltip, Button, Modal, Dropdown } from 'react-bootstrap';
import Container from './Container';

function Containers() {
  const [data, setData] = useState<TableCol[]>([]);
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy to clipboard");
  const [inactiveBtn, setInactiveBtn] = useState<boolean>(false);
  const [memUsage, setMemUsage] = useState<string>("--");
  const [memLimit, setMemLimit] = useState<string>("--");
  const [cpuUsage, setCPUUsage] = useState<string>("--");
  const [cpuLimit, setCPULimit] = useState<string>("--");
  const [id, setID] = useState<string>("");

  const copyToClipboard = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    setCopyTooltip("Copied");
    setTimeout(() => {
      setCopyTooltip("Copy to clipboard");
    }, 1500);
  };

  const renderTooltip = (props: { text: string }) => (
    <Tooltip id="icon-tooltip" {...props}>
      {props.text}
    </Tooltip>
  );

  type TableCol = {
    containerID: string;
    image: string;
    command: string;
    created: string;
    status: string;
    ports: string[];
    name: string;
    state: string;
  };

  const renderState = useCallback(({ getValue }: CellContext<TableCol, string>) => {
    const state = getValue();
    switch (state) {
      case "created":
        return <FaCircle color="#7f93ff"></FaCircle>
      case "restarting":
        return <FaCircle color="#ffdb20"></FaCircle>
      case "running":
        return <FaCircle color="#00d931"></FaCircle>
      case "removing":
        return <FaCircle color="#ff4343"></FaCircle>
      case "paused":
        return <FaCircle color="#ffdb20"></FaCircle>
      case "exited":
        return <FaCircle color="#ff4343"></FaCircle>
      case "deads":
        return <FaCircle color="#000"></FaCircle>
    }
    return <></>
  }, []);

  const renderContainerID = useCallback(({ getValue }: CellContext<TableCol, string>) => {
    const id = getValue();
    return (
      <>
        {id.slice(0, 12)}
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip({ text: copyTooltip })}>
          <span>
            <FaRegCopy className="ms-1 btn-icon" onClick={() => copyToClipboard(id)}></FaRegCopy>
          </span>
        </OverlayTrigger>
      </>
    )
  }, [copyTooltip]);

  const renderPorts = useCallback(({ getValue }: CellContext<TableCol, string[]>) => {
    const ports = getValue();
    const host = "localhost"
    let scheme = "http"
    return (
      <>
        {ports.map((v, i) => {
          const ret = v.match(/->(.*)\/tcp/);
          if (ret && ret.length > 1) {
            const port = ret[1];
            if (port == "443") {
              scheme = "https"
            }
            return (
              <a key={i} href={scheme + "://" + host + ":" + port} target='_blank'>:{port}<br /></a>
            )
          }
          return (
            <span key={i}>{v}<br /></span>
          )
        })}
      </>
    );
  }, []);

  const renderActions = useCallback(({ row }: CellContext<TableCol, unknown>) => {
    const id = row.original.containerID;
    const state = row.original.state;
    const name = row.original.name;
    return (
      <div className='input-group'>
        <Button variant='light' className={`me-1 rounded-circle ${isExited(state) ? '' : 'd-none'}`} disabled={inactiveBtn} onClick={() => startContainer(id.slice(0, 12))}><FaPlay></FaPlay></Button>
        <Button variant='light' className={`me-1 rounded-circle ${isPaused(state) ? '' : 'd-none'}`} disabled={inactiveBtn} onClick={() => unpauseContainer(id.slice(0, 12))}><FaPlay></FaPlay></Button>
        <Button variant='light' className={`me-1 rounded-circle ${isRunning(state) ? '' : 'd-none'}`} disabled={inactiveBtn} onClick={() => stopContainer(id.slice(0, 12))}><FaStop></FaStop></Button>
        <Dropdown>
          <Dropdown.Toggle variant="light" className='me-1 rounded-circle'>
            <FaEllipsisVertical></FaEllipsisVertical>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="1" disabled={inactiveBtn} onClick={() => setID(id)}><FaEye className='me-1'></FaEye> View details</Dropdown.Item>
            <Dropdown.Item eventKey="2" disabled={inactiveBtn || isPaused(state)} onClick={() => pauseContainer(id.slice(0, 12), state)}><FaPause className='me-1'></FaPause> Pause</Dropdown.Item>
            <Dropdown.Item eventKey="3" disabled={inactiveBtn} onClick={() => restartContainer(id.slice(0, 12))}><FaArrowRotateRight className='me-1'></FaArrowRotateRight> Restart</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div className='vr me-1'></div>
        <Button variant='light' className='rounded-circle' onClick={() => confirmDeleteContainer(id, name)}><FaRegTrashCan></FaRegTrashCan></Button>
      </div>
    )
  }, [inactiveBtn]);

  const columnHelper = createColumnHelper<TableCol>();

  const tableColumnDefs = [
    columnHelper.accessor((row) => row.state, {
      id: 'state',
      header: '#',
      cell: renderState,
    }),
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: 'Name',
    }),
    columnHelper.accessor((row) => row.containerID, {
      id: 'container_id',
      header: 'Container ID',
      cell: renderContainerID,
    }),
    columnHelper.accessor((row) => row.image, {
      id: 'image',
      header: 'Image',
    }),
    columnHelper.accessor((row) => row.ports, {
      id: 'ports',
      header: 'Port(s)',
      cell: renderPorts,
    }),
    columnHelper.accessor((row) => row.status, {
      id: 'status',
      header: 'status',
    }),
    columnHelper.display({
      id: 'action',
      header: 'Actions',
      cell: renderActions,
    }),
  ];

  type ModalVal = {
    id: string;
    name: string;
    show: boolean;
  }
  const [delModal, setDelModal] = useState<ModalVal>({ id: "", name: "", show: false });

  const table = useReactTable<TableCol>({
    columns: tableColumnDefs,
    data: data,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    listContainer(id);

    const interval = setInterval(() => {
      listContainer(id);
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  const listContainer = (id: string) => {
    if (id != "") {
      return;
    }

    const result = GoContainers();
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      let rows: TableCol[] = [];
      d.Containers.forEach((container) => {
        const t: TableCol = {
          containerID: container.ContainerID,
          image: container.Image,
          command: container.Command,
          created: container.Created,
          status: container.Status,
          ports: container.Ports,
          name: container.Name,
          state: container.State,
        };
        rows.push(t);
      });
      setData(rows);
    }).catch((err) => {
      console.log(err);
    });

    const stats = GoStatsContainer();
    stats.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      d.ContainerStats.forEach((container) => {
        // TODO s
        const s = {
          container_id: container.ContainerID,
          cpu_perc: container.CPUPerc,
          mem_perc: container.MemPerc,
          mem_usage: container.MemUsage,
        };
      });

      setMemUsage(d.Stats.MemUsage);
      setMemLimit(d.Stats.MemLimit);
      setCPUUsage(d.Stats.CPUUsage);
      setCPULimit(d.Stats.CPULimit);
    }).catch((err) => {
      console.log(err);
    });
  };

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
      listContainer("");
    });
  };

  const unpauseContainer = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoUnpauseContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      listContainer("");
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
      listContainer("")
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      listContainer("");
    });
  };

  const pauseContainer = (id: string, state: string) => {
    if (inactiveBtn) {
      return;
    }
    if (isPaused(state)) {
      return;
    }
    setInactiveBtn(true);
    const result = GoPauseContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      listContainer("");
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
      listContainer("");
    });
  };

  const deleteContainer = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoDeleteContainer(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      closeDelModal();
      listContainer("");
    });
  };

  const isExited = (state: string) => {
    switch (state) {
      case "created":
      case "exited":
      case "deads":
        return true;
    }
    return false;
  };

  const isPaused = (state: string) => {
    switch (state) {
      case "paused":
        return true;
    }
    return false;
  };

  const isRunning = (state: string) => {
    switch (state) {
      case "restarting":
      case "running":
      case "removing":
        return true;
    }
    return false;
  };

  const closeDelModal = () => {
    setDelModal({ id: delModal.id, name: delModal.name, show: false });
  };

  const confirmDeleteContainer = (id: string, name: string) => {
    setDelModal({ id: id, name: name, show: true });
  };

  return (
    <article>
      {id ?
        <Container id={id} setID={setID}></Container> :
        <div>
          <div className="row">
            <div className="col-6">
              <span>Container CPU usage</span>
              <h5 className='fw-bold'><span className='text-success'>{cpuUsage}</span> / <span className='text-black-50'>{cpuLimit}</span></h5>
            </div>
            <div className="col-6">
              <span>Container memory usage</span>
              <h5 className='fw-bold'><span className='text-success'>{memUsage}</span> / <span className='text-black-50'>{memLimit}</span></h5>
            </div>
            <div className="col-12">
              <div className="table-area table-containers overflow-auto">
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
          </div>

          <Modal show={delModal.show} onHide={() => closeDelModal()}>
            <Modal.Header closeButton>
              <Modal.Title>Delete container?</Modal.Title>
            </Modal.Header>
            <Modal.Body>The '{delModal.name}' container is selected for deletion. Any anonymous volumes associated with this container are also deleted.</Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => closeDelModal()}>
                Close
              </Button>
              <Button variant="danger" disabled={inactiveBtn} onClick={() => deleteContainer(delModal.id)}>
                Delete forever
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      }
    </article>
  )
}

export default Containers
