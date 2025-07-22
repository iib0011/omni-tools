import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { UserType } from '@tools/defineTool';

const userTypes: UserType[] = ['General Users', 'Developers', 'CyberSec'];

interface UserTypeFilterProps {
  selectedUserTypes: UserType[];
  onUserTypesChange: (userTypes: UserType[]) => void;
}

export default function UserTypeFilter({
  selectedUserTypes,
  onUserTypesChange
}: UserTypeFilterProps) {
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
          label={userType}
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
