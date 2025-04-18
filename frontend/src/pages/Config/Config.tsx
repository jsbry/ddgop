import { useEffect, useState } from "react";
import { GoConfigGet, GoConfigUpdate } from "../../../wailsjs/go/main/App";
import { Form } from 'react-bootstrap';
import NotificationToast from "../../components/Toast/Toast";

function Config() {
  const [withHostType, setWithHostType] = useState<number>(1);
  const [withHost, setWithHost] = useState<string>("");
  const [show, setShow] = useState(false);
  const [modified, setModified] = useState("just now");

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = () => {
    const result = GoConfigGet();
    result.then((d) => {
      console.log(d);
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      setWithHostType(d.WithHostType)
      setWithHost(d.WithHost)
    }).catch((err) => {
      console.log(err);
    });
  };

  const updateConfig = () => {
    const stats = GoConfigUpdate(withHostType, withHost);
    stats.then((d) => {
      if (d.Error != null) {
        throw new Error(d.Error);
      }
      console.log(d);
      setShow(true);
      setModified(d.Modified);
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <article>
      <div className="row">
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="connection-type">Connection type</label>
            <Form.Select
              id="connection-type"
              value={withHostType}
              onChange={(e) => setWithHostType(Number(e.target.value))}
            >
              <option value={0}>Select Connection Type</option>
              <option value={1}>in Host</option>
              <option value={2}>tcp</option>
            </Form.Select>
          </div>
          {withHostType == 2 &&
            <div className="mb-3">
              <label htmlFor="tcp">tcp</label>
              <input
                type="text"
                className="form-control"
                id="tcp"
                placeholder="tcp://localhost:2375"
                value={withHost}
                onChange={(e) => setWithHost(e.target.value)}
              />
            </div>
          }
          <div className="mb-3">
            <button className="btn btn-sm btn-primary" onClick={() => updateConfig()}>Update</button>
          </div>
        </div>
      </div>
      <NotificationToast modified={modified} show={show} setShow={setShow}></NotificationToast>
    </article>
  )
}

export default Config
