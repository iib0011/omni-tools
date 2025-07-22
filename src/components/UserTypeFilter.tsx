import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { UserType } from '@tools/defineTool';

const userTypes: UserType[] = [
  'General Users',
  'Developers',
  'Designers',
  'CyberSec'
];

interface UserTypeFilterProps {
  selectedUserTypes: UserType[];
  onUserTypesChange: (userTypes: UserType[]) => void;
  label?: string;
}

export default function UserTypeFilter({
  selectedUserTypes,
  onUserTypesChange,
  label = 'Filter by User Type'
}: UserTypeFilterProps) {
  return (
    <Box sx={{ minWidth: 200 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
    </Box>
  );
}

// Hook to manage user type filter state with localStorage
export function useUserTypeFilter() {
  const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('selectedUserTypes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      'selectedUserTypes',
      JSON.stringify(selectedUserTypes)
    );
  }, [selectedUserTypes]);

  return {
    selectedUserTypes,
    setSelectedUserTypes
  };
}
