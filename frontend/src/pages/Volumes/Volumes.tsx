import { useEffect, useState, useCallback } from "react";
import { GoVolumes, GoDeleteVolume } from "../../../wailsjs/go/main/App";
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender, CellContext } from '@tanstack/react-table';
import { OverlayTrigger, Button, Modal } from 'react-bootstrap';
import { FaRegCopy, FaRegTrashCan, FaArrowRotateRight } from "react-icons/fa6";
import * as h from '../helper';

function Volumes() {
  const [data, setData] = useState<TableCol[]>([]);
  const [size, setSize] = useState<string>("--");
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy to clipboard");
  const [inactiveBtn, setInactiveBtn] = useState<boolean>(false);

  useEffect(() => {
    listVolume();
  }, []);

  const renderActions = useCallback(({ row }: CellContext<TableCol, unknown>) => {
    const name = row.original.name;
    return (
      <div className='input-group'>
        <Button variant='light' className='rounded-circle' onClick={() => confirmDeleteVolume(name)}><FaRegTrashCan></FaRegTrashCan></Button>
      </div>
    )
  }, []);

  type TableCol = {
    name: string;
    driver: string;
    size: string;
  };

  const renderVolumeName = useCallback(({ getValue }: CellContext<TableCol, string>) => {
    const name = getValue();
    return (
      <>
        {name}
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={h.renderTooltip({ text: copyTooltip })}>
          <span>
            <FaRegCopy className="ms-1 btn-icon" onClick={() => h.copyToClipboard(name, setCopyTooltip)}></FaRegCopy>
          </span>
        </OverlayTrigger>
      </>
    )
  }, [copyTooltip]);

  const columnHelper = createColumnHelper<TableCol>();

  const tableColumnDefs = [
    columnHelper.accessor((row) => row.driver, {
      id: 'driver',
      header: 'Driver',
    }),
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: 'Name',
      cell: renderVolumeName,
    }),
    columnHelper.accessor((row) => row.size, {
      id: 'size',
      header: 'Size',
    }),
    columnHelper.display({
      id: 'action',
      header: 'Actions',
      cell: renderActions,
    }),
  ];

  const closeDelModal = () => {
    setDelModal({ name: delModal.name, show: false });
  };

  type ModalVal = {
    name: string;
    show: boolean;
  }
  const [delModal, setDelModal] = useState<ModalVal>({ name: "", show: false });

  const table = useReactTable<TableCol>({
    columns: tableColumnDefs,
    data: data,
    getCoreRowModel: getCoreRowModel(),
  })

  const listVolume = () => {
    const result = GoVolumes();
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      let rows: TableCol[] = [];
      d.Volumes.forEach((volume) => {
        const t: TableCol = {
          name: volume.Name,
          driver: volume.Driver,
          size: volume.Size,
        };
        rows.push(t);
      });
      setData(rows);
      setSize(d.Stats.Size);
    }).catch((err) => {
      console.log(err);
    });
  };

  const reloadList = () => {
    setData([]);
    setSize("");
    listVolume();
  }

  const deleteVolume = (name: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoDeleteVolume(name);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      closeDelModal();
      listVolume();
    });
  };

  const confirmDeleteVolume = (name: string) => {
    setDelModal({ name: name, show: true });
  };

  return (
    <article>
      <div>
        <div className="row">
          <div className="col-6">
            <span className="small">{size}</span>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <FaArrowRotateRight className="btn-icon" onClick={reloadList}></FaArrowRotateRight>
          </div>
          <div className="col-12">
            <div className="table-area table-volumes overflow-auto">
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
            <Modal.Title>Delete volume?</Modal.Title>
          </Modal.Header>
          <Modal.Body>The '{delModal.name}' volume is selected for deletion.</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => closeDelModal()}>
              Close
            </Button>
            <Button variant="danger" disabled={inactiveBtn} onClick={() => deleteVolume(delModal.name)}>
              Delete forever
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </article>
  )
}

export default Volumes
