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
	export class rContainers {
	    containers: Container[];
	    error: any;
	
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
	    error: any;
	
	    static createFrom(source: any = {}) {
	        return new rDeleteContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_id = source["container_id"];
	        this.error = source["error"];
	    }
	}
	export class rPauseContainer {
	    container_id: string;
	    error: any;
	
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
	    error: any;
	
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
	    error: any;
	
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
	    error: any;
	
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
	    error: any;
	
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

