import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

function NotificationToast(
  props: {
    header: string,
    body: string,
    modified: string,
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
  }
) {
  const { header, body, modified, show, setShow } = props;

  return (
    <div>
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">{header}</strong>
            <small className="text-muted">{modified}</small>
          </Toast.Header>
          <Toast.Body>{body}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default NotificationToast;