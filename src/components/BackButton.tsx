import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useNavigationType } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType(); // Check if there is a history state
  const disabled = navigationType === 'POP';
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <IconButton onClick={handleBack} disabled={disabled}>
      <ArrowBackIcon color={disabled ? 'action' : 'primary'} />
    </IconButton>
  );
};

export default BackButton;
