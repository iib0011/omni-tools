import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme
} from '@mui/material';
import { UserType } from '@tools/defineTool';

const userTypes: UserType[] = [
  'General Users',
  'Developers',
  'Designers',
  'Students',
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
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<UserType[]>) => {
    const {
      target: { value }
    } = event;
    const newUserTypes =
      typeof value === 'string' ? (value.split(',') as UserType[]) : value;
    onUserTypesChange(newUserTypes);
  };

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth>
        <InputLabel id="user-type-filter-label">{label}</InputLabel>
        <Select
          labelId="user-type-filter-label"
          id="user-type-filter"
          multiple
          value={selectedUserTypes}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '& .MuiChip-deleteIcon': {
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        >
          {userTypes.map((userType) => (
            <MenuItem key={userType} value={userType}>
              {userType}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
