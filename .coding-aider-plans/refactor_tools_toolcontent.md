[Coding Aider Plan]

## Overview
This plan outlines the refactoring of existing tools to utilize a `ToolContent` component. This will standardize the structure and styling of tool content across the application, improving maintainability and user experience.

## Problem Description
Currently, some tools directly render their content without using a common `ToolContent` component. This leads to inconsistencies in styling, layout, and overall structure.  It also makes it harder to apply global changes or updates to the tool content areas.

## Goals
- Identify tools that do not currently use `ToolContent`.
- Implement `ToolContent` in these tools.
- Ensure consistent styling and layout across all tools.

## Additional Notes and Constraints
- The `ToolContent` component should be flexible enough to accommodate the different types of content used by each tool.
- Ensure that the refactoring does not introduce any regressions or break existing functionality.
- Consider creating a subplan if the number of tools requiring changes is large or if individual tools require complex modifications.

## References
- Existing tools that already use `ToolContent` can serve as examples.
