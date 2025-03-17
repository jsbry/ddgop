import { useEffect, useState, useCallback } from "react";
import { GoNetworks, GoDeleteNetwork } from "../../../wailsjs/go/main/App";
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender, CellContext } from '@tanstack/react-table';
import { OverlayTrigger, Button, Modal } from 'react-bootstrap';
import { FaRegCopy, FaRegTrashCan, FaArrowRotateRight } from "react-icons/fa6";
import * as h from '../helper';

function Networks() {
  const [data, setData] = useState<TableCol[]>([]);
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy to clipboard");
  const [inactiveBtn, setInactiveBtn] = useState<boolean>(false);

  useEffect(() => {
    listNetwork();
  }, []);

  const renderActions = useCallback(({ row }: CellContext<TableCol, unknown>) => {
    // const name = row.original.name;
    const id = row.original.networkID.slice(0, 12);
    return (
      <div className='input-group'>
        <Button variant='light' className='rounded-circle' onClick={() => confirmDeleteNetwork(id)}><FaRegTrashCan></FaRegTrashCan></Button>
      </div>
    )
  }, []);

  type TableCol = {
    name: string;
    networkID: string;
    driver: string;
  };

  const renderNetworkID = useCallback(({ getValue }: CellContext<TableCol, string>) => {
    const id = getValue();
    return (
      <>
        {id.slice(0, 12)}
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={h.renderTooltip({ text: copyTooltip })}>
          <span>
            <FaRegCopy className="ms-1 btn-icon" onClick={() => h.copyToClipboard(id, setCopyTooltip)}></FaRegCopy>
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
    columnHelper.accessor((row) => row.networkID, {
      id: 'id',
      header: 'ID',
      cell: renderNetworkID,
    }),
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: 'Name',
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

  const listNetwork = () => {
    const result = GoNetworks();
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      let rows: TableCol[] = [];
      d.Networks.forEach((network) => {
        const t: TableCol = {
          name: network.Name,
          networkID: network.NetworkID,
          driver: network.Driver,
        };
        rows.push(t);
      });
      setData(rows);
    }).catch((err) => {
      console.log(err);
    });
  };

  const reloadList = () => {
    setData([]);
    listNetwork();
  }

  const deleteNetwork = (name: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoDeleteNetwork(name);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      closeDelModal();
      listNetwork();
    });
  };

  const confirmDeleteNetwork = (name: string) => {
    setDelModal({ name: name, show: true });
  };

  return (
    <article>
      <div>
        <div className="row">
          <div className="col-6">
            <span className="small">&ensp;</span>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <FaArrowRotateRight className="btn-icon" onClick={reloadList}></FaArrowRotateRight>
          </div>
          <div className="col-12">
            <div className="table-area table-networks overflow-auto">
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
            <Modal.Title>Delete network?</Modal.Title>
          </Modal.Header>
          <Modal.Body>The '{delModal.name}' network is selected for deletion.</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => closeDelModal()}>
              Close
            </Button>
            <Button variant="danger" disabled={inactiveBtn} onClick={() => deleteNetwork(delModal.name)}>
              Delete forever
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </article>
  )
}

export default Networks
