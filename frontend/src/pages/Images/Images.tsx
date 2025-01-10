import { useEffect, useState, useCallback } from "react";
import { GoImages, GoDeleteImage } from "../../../wailsjs/go/main/App";
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender, CellContext } from '@tanstack/react-table';
import { OverlayTrigger, Button, Modal, ProgressBar } from 'react-bootstrap';
import { FaRegCopy, FaRegTrashCan, FaArrowRotateRight } from "react-icons/fa6";
import * as h from '../helper';

function Images() {
  const [data, setData] = useState<TableCol[]>([]);
  const [size, setSize] = useState<string>("--");
  const [copyTooltip, setCopyTooltip] = useState<string>("Copy to clipboard");
  const [inactiveBtn, setInactiveBtn] = useState<boolean>(false);

  useEffect(() => {
    listImage();
  }, []);

  const renderActions = useCallback(({ row }: CellContext<TableCol, unknown>) => {
    const id = row.original.imageID;
    const name = row.original.name;
    const tag = row.original.tag;
    return (
      <div className='input-group'>
        <Button variant='light' className='rounded-circle' onClick={() => confirmDeleteImage(id, name, tag)}><FaRegTrashCan></FaRegTrashCan></Button>
      </div>
    )
  }, []);

  type TableCol = {
    imageID: string;
    name: string;
    tag: string;
    created: string;
    size: string;
  };

  const renderImageID = useCallback(({ getValue }: CellContext<TableCol, string>) => {
    const id = getValue();
    return (
      <>
        {id.slice(7, 19)}
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
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: 'Name',
    }),
    columnHelper.accessor((row) => row.tag, {
      id: 'tag',
      header: 'Tag',
    }),
    columnHelper.accessor((row) => row.created, {
      id: 'created',
      header: 'Created',
    }),
    columnHelper.accessor((row) => row.size, {
      id: 'size',
      header: 'Size',
    }),
    columnHelper.accessor((row) => row.imageID, {
      id: 'id',
      header: 'ID',
      cell: renderImageID,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Actions',
      cell: renderActions,
    }),
  ];

  const closeDelModal = () => {
    setDelModal({ id: delModal.id, name: delModal.name, show: false });
  };

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

  const listImage = () => {
    const result = GoImages();
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      let rows: TableCol[] = [];
      d.Images.forEach((image) => {
        const t: TableCol = {
          imageID: image.ImageID,
          name: image.Name,
          tag: image.Tag,
          size: image.Size,
          created: image.CreatedAt,
        };
        rows.push(t);
      });
      setData(rows);
      setSize(d.Stats.Size);
    }).catch((err) => {
      console.log(err);
    });
  };

  const deleteImage = (id: string) => {
    if (inactiveBtn) {
      return;
    }
    setInactiveBtn(true);
    const result = GoDeleteImage(id);
    result.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setInactiveBtn(false);
      closeDelModal();
      listImage();
    });
  };

  const confirmDeleteImage = (id: string, name: string, tag: string) => {
    setDelModal({ id: id, name: name + ':' + tag, show: true });
  };

  return (
    <article>
      <div>
        <div className="row">
          <div className="col-6">
            <ProgressBar now={100} />
            <span className="small">{size}</span>
          </div>
          <div className="col-6">
            <FaArrowRotateRight></FaArrowRotateRight>
          </div>
          <div className="col-12">
            <div className="table-area table-images overflow-auto">
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
            <Modal.Title>Delete image?</Modal.Title>
          </Modal.Header>
          <Modal.Body>The '{delModal.name}' image is selected for deletion.</Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => closeDelModal()}>
              Close
            </Button>
            <Button variant="danger" disabled={inactiveBtn} onClick={() => deleteImage(delModal.id)}>
              Delete forever
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </article>
  )
}

export default Images
