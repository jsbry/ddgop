export namespace image {
	
	export class DeleteResponse {
	    Deleted?: string;
	    Untagged?: string;
	
	    static createFrom(source: any = {}) {
	        return new DeleteResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Deleted = source["Deleted"];
	        this.Untagged = source["Untagged"];
	    }
	}

}

export namespace main {
	
	export class Container {
	    ContainerID: string;
	    Image: string;
	    Command: string;
	    Created: string;
	    Status: string;
	    Ports: number[];
	    Name: string;
	    State: string;
	    SubContainers: Container[];
	    Mounts: string[];
	
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
	        this.SubContainers = this.convertValues(source["SubContainers"], Container);
	        this.Mounts = source["Mounts"];
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
	export class ContainerStats {
	    ContainerID: string;
	    CPUPerc: string;
	    CPULimit: string;
	    MemPerc: string;
	    MemUsage: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ContainerID = source["ContainerID"];
	        this.CPUPerc = source["CPUPerc"];
	        this.CPULimit = source["CPULimit"];
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
	export class Image {
	    Name: string;
	    Tag: string;
	    CreatedAt: string;
	    CreatedSince: string;
	    Size: string;
	    ImageID: string;
	
	    static createFrom(source: any = {}) {
	        return new Image(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Tag = source["Tag"];
	        this.CreatedAt = source["CreatedAt"];
	        this.CreatedSince = source["CreatedSince"];
	        this.Size = source["Size"];
	        this.ImageID = source["ImageID"];
	    }
	}
	export class ImageStats {
	    Size: string;
	
	    static createFrom(source: any = {}) {
	        return new ImageStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Size = source["Size"];
	    }
	}
	export class Network {
	    Name: string;
	    NetworkID: string;
	    Driver: string;
	
	    static createFrom(source: any = {}) {
	        return new Network(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.NetworkID = source["NetworkID"];
	        this.Driver = source["Driver"];
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
	export class Volume {
	    Name: string;
	    Driver: string;
	    Size: string;
	
	    static createFrom(source: any = {}) {
	        return new Volume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Driver = source["Driver"];
	        this.Size = source["Size"];
	    }
	}
	export class VolumeStats {
	    Size: string;
	
	    static createFrom(source: any = {}) {
	        return new VolumeStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Size = source["Size"];
	    }
	}
	export class rConfig {
	    WithHostType: number;
	    WithHost: string;
	    Modified: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.WithHostType = source["WithHostType"];
	        this.WithHost = source["WithHost"];
	        this.Modified = source["Modified"];
	        this.Error = source["Error"];
	    }
	}
	export class rContainerStats {
	    ContainerStats: ContainerStats;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
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
	export class rContainersStats {
	    Stats: Stats;
	    ContainerStats: ContainerStats[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainersStats(source);
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
	export class rDeleteImage {
	    Images: image.DeleteResponse[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Images = this.convertValues(source["Images"], image.DeleteResponse);
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
	export class rDeleteNetwork {
	    NetworkName: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteNetwork(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.NetworkName = source["NetworkName"];
	        this.Error = source["Error"];
	    }
	}
	export class rDeleteVolume {
	    VolumeName: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteVolume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.VolumeName = source["VolumeName"];
	        this.Error = source["Error"];
	    }
	}
	export class rExecContainer {
	    Command: string;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rExecContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
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
	export class rImages {
	    Images: Image[];
	    Stats: ImageStats;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rImages(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Images = this.convertValues(source["Images"], Image);
	        this.Stats = this.convertValues(source["Stats"], ImageStats);
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
	export class rNetworks {
	    Networks: Network[];
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rNetworks(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Networks = this.convertValues(source["Networks"], Network);
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
	export class rVolumes {
	    Volumes: Volume[];
	    Stats: VolumeStats;
	    Error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rVolumes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Volumes = this.convertValues(source["Volumes"], Volume);
	        this.Stats = this.convertValues(source["Stats"], VolumeStats);
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

}

