import React from 'react';
import { Box, Chip } from '@mui/material';
import { UserType } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

interface UserTypeFilterProps {
  selectedUserTypes: UserType[];
  userTypes?: UserType[];
  onUserTypesChange: (userTypes: UserType[]) => void;
}

export default function UserTypeFilter({
  selectedUserTypes,
  onUserTypesChange,
  userTypes = ['generalUsers', 'developers']
}: UserTypeFilterProps) {
  const { t } = useTranslation('translation');
  if (userTypes.length <= 1) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {userTypes.map((userType) => (
        <Chip
          key={userType}
          label={t(`userTypes.${userType}`)}
          color={selectedUserTypes.includes(userType) ? 'primary' : 'default'}
          onClick={() => {
            const isSelected = selectedUserTypes.includes(userType);
            const newUserTypes = isSelected
              ? selectedUserTypes.filter((ut) => ut !== userType)
              : [...selectedUserTypes, userType];
            onUserTypesChange(newUserTypes);
          }}
          sx={{ cursor: 'pointer' }}
        />
      ))}
    </Box>
  );
}
