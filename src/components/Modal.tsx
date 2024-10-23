import { forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = forwardRef(function Modal({ children } : { children : React.ReactNode}, ref: React.Ref<{ open: () => void; close: () => void }>) {
  const dialog = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        if (!dialog.current) {
          return;
        }
        dialog.current.showModal();
      },
      close: () => {
        if (!dialog.current) {
          return;
        }
        dialog.current.close();
      },
    };
  });

  const modalRoot = document.getElementById('modal');
  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <dialog className="modal" ref={dialog}>
      {children}
    </dialog>,
    modalRoot
  );
});

export default Modal;
