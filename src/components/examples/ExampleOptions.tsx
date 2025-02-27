import ToolOptionGroups from '@components/options/ToolOptionGroups';
import { GetGroupsType } from '@components/options/ToolOptions';
import React from 'react';

export default function ExampleOptions<T>({
  options,
  getGroups
}: {
  options: T;
  getGroups: GetGroupsType<T>;
}) {
  return (
    <ToolOptionGroups
      // @ts-ignore
      groups={getGroups({ values: options })}
      vertical
    />
  );
}
