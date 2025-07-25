import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo
} from 'react';
import { UserType } from '@tools/defineTool';

interface UserTypeFilterContextType {
  selectedUserTypes: UserType[];
  setSelectedUserTypes: (userTypes: UserType[]) => void;
}

const UserTypeFilterContext = createContext<UserTypeFilterContextType | null>(
  null
);

interface UserTypeFilterProviderProps {
  children: ReactNode;
}

export function UserTypeFilterProvider({
  children
}: UserTypeFilterProviderProps) {
  const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>(() => {
    try {
      const saved = localStorage.getItem('selectedUserTypes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(
        'Error loading selectedUserTypes from localStorage:',
        error
      );
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'selectedUserTypes',
        JSON.stringify(selectedUserTypes)
      );
    } catch (error) {
      console.error('Error saving selectedUserTypes to localStorage:', error);
    }
  }, [selectedUserTypes]);

  const contextValue = useMemo(
    () => ({
      selectedUserTypes,
      setSelectedUserTypes
    }),
    [selectedUserTypes]
  );

  return (
    <UserTypeFilterContext.Provider value={contextValue}>
      {children}
    </UserTypeFilterContext.Provider>
  );
}

export function useUserTypeFilter(): UserTypeFilterContextType {
  const context = useContext(UserTypeFilterContext);

  if (!context) {
    throw new Error(
      'useUserTypeFilter must be used within a UserTypeFilterProvider. ' +
        'Make sure your component is wrapped with <UserTypeFilterProvider>.'
    );
  }

  return context;
}
