// External
import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';

// Internal
import { removeNotification } from 'lib/ui';
import SnackBar from 'components/SnackBar';
import { timing } from 'styles';

const outro = { opacity: [1, 0] };

const NotificationComponent = styled(SnackBar)({
  '&::after': {
    content: '"✕"',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: 2,
    right: 5,
    opacity: 0,
    transition: `opacity ${timing.normal}`,
  },
  '&:hover': {
    '&::after': {
      opacity: 1,
    },
  },
});

export default function Notification({
  notifID,
  onClick,
  type = 'info',
  autoClose = 5000,
  ...rest
}) {
  const notifRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    startAutoClose();
    return stopAutoClose;
  }, []);

  const closeWithAnimation = () => {
    if (notifID) {
      const duration = parseInt(timing.quick);
      stopAutoClose();
      notifRef.current.animate(outro, {
        duration,
        easing: 'ease-in',
        fill: 'both',
      });
      setTimeout(() => {
        removeNotification(notifID);
      }, duration);
    }
  };

  const stopAutoClose = () => {
    clearTimeout(timerRef.current);
  };

  const startAutoClose = () => {
    if (autoClose) {
      stopAutoClose();
      timerRef.current = setTimeout(closeWithAnimation, autoClose);
    }
  };

  return (
    <NotificationComponent
      ref={notifRef}
      type={type}
      onClick={onClick ? () => onClick(closeWithAnimation) : closeWithAnimation}
      onMouseEnter={stopAutoClose}
      onMouseLeave={startAutoClose}
      {...rest}
    />
  );
}
