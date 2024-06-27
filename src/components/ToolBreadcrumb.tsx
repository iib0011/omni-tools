import React from 'react';
import { Breadcrumbs, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  link?: string; // link is optional for the last item
}

interface BreadcrumbComponentProps {
  items: BreadcrumbItem[];
}

const ToolBreadcrumb: React.FC<BreadcrumbComponentProps> = ({ items }) => {
  const theme = useTheme();
  return (
    <Breadcrumbs>
      {items.map((item, index) => {
        if (index === items.length - 1 || !item.link) {
          return (
            <Typography color="textPrimary" key={index}>
              {item.title}
            </Typography>
          );
        }
        return (
          <Link color={theme.palette.primary.main} to={item.link} key={index}>
            {item.title}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default ToolBreadcrumb;
