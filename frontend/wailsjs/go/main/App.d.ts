// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function GoContainers():Promise<main.rContainers>;

export function GoDeleteContainer(arg1:string):Promise<main.rDeleteContainer>;

export function GoExecContainer(arg1:string):Promise<main.rExecContainer>;

export function GoFilesContainer(arg1:string,arg2:string):Promise<main.rFilesContainer>;

export function GoInspectContainer(arg1:string):Promise<main.rInspectContainer>;

export function GoLogsContainer(arg1:string):Promise<void>;

export function GoPauseContainer(arg1:string):Promise<main.rPauseContainer>;

export function GoRestartContainer(arg1:string):Promise<main.rRestartContainer>;

export function GoStartContainer(arg1:string):Promise<main.rStartContainer>;

export function GoStatsContainer():Promise<main.rContainerStats>;

export function GoStopContainer(arg1:string):Promise<main.rStopContainer>;

export function GoUnpauseContainer(arg1:string):Promise<main.rUnpauseContainer>;

export function Greet(arg1:string):Promise<string>;
