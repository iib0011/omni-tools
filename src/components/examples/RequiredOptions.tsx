import ToolOptionGroups from '@components/options/ToolOptionGroups';
import { GetGroupsType } from '@components/options/ToolOptions';
import React from 'react';

export default function RequiredOptions<T>({
  options,
  getGroups
}: {
  options: T;
  getGroups: GetGroupsType<T>;
}) {
  return <ToolOptionGroups groups={getGroups({ values: options })} />;
}
