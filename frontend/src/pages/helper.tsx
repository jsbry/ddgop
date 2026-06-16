import { Tooltip } from 'react-bootstrap';
import { SortDirection } from '@tanstack/react-table';
import { TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted } from "react-icons/ti";

export type GProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export const isExited = (state: string) => {
  switch (state) {
    case "created":
    case "exited":
    case "deads":
      return true;
  }
  return false;
};

export const isPaused = (state: string) => {
  switch (state) {
    case "paused":
      return true;
  }
  return false;
};

export const isRunning = (state: string) => {
  switch (state) {
    case "restarting":
    case "running":
    case "removing":
      return true;
  }
  return false;
};

export const copyToClipboard = async (txt: string, setCopyTooltip: React.Dispatch<React.SetStateAction<string>>) => {
  await navigator.clipboard.writeText(txt);
  setCopyTooltip("Copied");
  setTimeout(() => {
    setCopyTooltip("Copy to clipboard");
  }, 1500);
};

export const renderTooltip = (props: { text: string }) => (
  <Tooltip id="icon-tooltip" {...props}>
    {props.text}
  </Tooltip>
);

export const getSortIcon = (sortDirection: false | SortDirection) => {
  switch (sortDirection) {
    case "asc":
      return <TiArrowSortedUp />;
    case "desc":
      return <TiArrowSortedDown />;
    default:
      return <TiArrowUnsorted />;
  }
};
