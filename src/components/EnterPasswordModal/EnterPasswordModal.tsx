import Modal from '../Modal';

const EnterPasswordModal = ({
  onClose,
  open,
  onPasswordChange,
  password,
  onSubmit,
}: {
  onClose: any;
  open: boolean;
  onPasswordChange: any;
  password: string | undefined;
  onSubmit: any;
}) => {
  return (
    <Modal
      open={open}
      primaryButtonText='Submit'
      onClose={onClose}
      onApplySettings={onSubmit}
    >
      <label>Password</label>
      <input
        name='password'
        type='password'
        placeholder='password'
        onChange={onPasswordChange}
        value={password}
      ></input>
    </Modal>
  );
};

export default EnterPasswordModal;
