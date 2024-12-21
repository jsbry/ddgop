export namespace main {
	
	export class Container {
	    ContainerID: string;
	    Image: string;
	    Command: string;
	    Created: string;
	    Status: string;
	    Ports: string[];
	    Name: string;
	    State: string;
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Image = source["Image"];
	        this.Command = source["Command"];
	        this.Created = source["Created"];
	        this.Status = source["Status"];
	        this.Ports = source["Ports"];
	        this.Name = source["Name"];
	        this.State = source["State"];
	    }
	}
	export class ContainerStats {
	    ContainerID: string;
	    CPUPerc: string;
	    MemPerc: string;
	    MemUsage: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.CPUPerc = source["CPUPerc"];
	        this.MemPerc = source["MemPerc"];
	        this.MemUsage = source["MemUsage"];
	    }
	}
	export class File {
	    Mode: string;
	    Links: number;
	    Owner: string;
	    Group: string;
	    Size: string;
	    ModifiedAt: string;
	    Name: string;
	    AbsolutePath: string;
	    IsDir: boolean;
	    SubFiles: File[];
	
	    static createFrom(source: any = {}) {
	        return new File(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Mode = source["Mode"];
	        this.Links = source["Links"];
	        this.Owner = source["Owner"];
	        this.Group = source["Group"];
	        this.Size = source["Size"];
	        this.ModifiedAt = source["ModifiedAt"];
	        this.Name = source["Name"];
	        this.AbsolutePath = source["AbsolutePath"];
	        this.IsDir = source["IsDir"];
	        this.SubFiles = this.convertValues(source["SubFiles"], File);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Stats {
	    CPUUsage: string;
	    CPULimit: string;
	    MemUsage: string;
	    MemLimit: string;
	
	    static createFrom(source: any = {}) {
	        return new Stats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CPUUsage = source["CPUUsage"];
	        this.CPULimit = source["CPULimit"];
	        this.MemUsage = source["MemUsage"];
	        this.MemLimit = source["MemLimit"];
	    }
	}
	export class rContainerStats {
	    Stats: Stats;
	    ContainerStats: ContainerStats[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Stats = this.convertValues(source["Stats"], Stats);
	        this.ContainerStats = this.convertValues(source["ContainerStats"], ContainerStats);
	        this.Error = source["Error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class rContainers {
	    Containers: Container[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainers(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Containers = this.convertValues(source["Containers"], Container);
	        this.Error = source["Error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class rDeleteContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}
	export class rExecContainer {
	    Exec: string;
	    Command: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rExecContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Exec = source["Exec"];
	        this.Command = source["Command"];
	        this.Error = source["Error"];
	    }
	}
	export class rFilesContainer {
	    Files: File[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rFilesContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Files = this.convertValues(source["Files"], File);
	        this.Error = source["Error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class rInspectContainer {
	    Inspect: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rInspectContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Inspect = source["Inspect"];
	        this.Error = source["Error"];
	    }
	}
	export class rPauseContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rPauseContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}
	export class rRestartContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rRestartContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}
	export class rStartContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rStartContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}
	export class rStopContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rStopContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}
	export class rUnpauseContainer {
	    ContainerID: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rUnpauseContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.Error = source["Error"];
	    }
	}

}

