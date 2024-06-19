import {Box} from "@mui/material";
import {ReactNode} from "react";

export default function ToolLayout({children}: { children: ReactNode }) {
  return (<Box width={'100%'} display={'flex'} flexDirection={'column'} alignItems={'center'}><Box
    width={'85%'}>{children}</Box></Box>)
}
