import { Tooltip } from 'react-bootstrap';

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
