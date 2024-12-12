export namespace main {
	
	export class Container {
	    container_id: string;
	    image: string;
	    command: string;
	    created: string;
	    status: string;
	    ports: string[];
	    name: string;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.image = source["image"];
	        this.command = source["command"];
	        this.created = source["created"];
	        this.status = source["status"];
	        this.ports = source["ports"];
	        this.name = source["name"];
	        this.state = source["state"];
	    }
	}
	export class ContainerStats {
	    container_id: string;
	    cpu_perc: string;
	    mem_perc: string;
	    mem_usage: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.cpu_perc = source["cpu_perc"];
	        this.mem_perc = source["mem_perc"];
	        this.mem_usage = source["mem_usage"];
	    }
	}
	export class Stats {
	    cpu_usage: string;
	    cpu_limit: string;
	    mem_usage: string;
	    mem_limit: string;
	
	    static createFrom(source: any = {}) {
	        return new Stats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu_usage = source["cpu_usage"];
	        this.cpu_limit = source["cpu_limit"];
	        this.mem_usage = source["mem_usage"];
	        this.mem_limit = source["mem_limit"];
	    }
	}
	export class rContainerStats {
	    stats: Stats;
	    container_stats: ContainerStats[];
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.stats = this.convertValues(source["stats"], Stats);
	        this.container_stats = this.convertValues(source["container_stats"], ContainerStats);
	        this.error = source["error"];
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
	    containers: Container[];
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rContainers(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.containers = this.convertValues(source["containers"], Container);
	        this.error = source["error"];
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
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rInspectContainer {
	    inspect: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rInspectContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.inspect = source["inspect"];
	        this.error = source["error"];
	    }
	}
	export class rLogsContainer {
	    logs: string[];
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rLogsContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.logs = source["logs"];
	        this.error = source["error"];
	    }
	}
	export class rPauseContainer {
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rPauseContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rRestartContainer {
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rRestartContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rStartContainer {
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rStartContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rStopContainer {
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rStopContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rUnpauseContainer {
	    container_id: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new rUnpauseContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}

}

