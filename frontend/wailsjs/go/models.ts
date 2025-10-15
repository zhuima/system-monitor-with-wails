export namespace models {
	
	export class Alert {
	    id: number;
	    rule_id: number;
	    rule_name: string;
	    message: string;
	    level: string;
	    value: number;
	    threshold: number;
	    status: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    resolved_at?: any;
	
	    static createFrom(source: any = {}) {
	        return new Alert(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.rule_id = source["rule_id"];
	        this.rule_name = source["rule_name"];
	        this.message = source["message"];
	        this.level = source["level"];
	        this.value = source["value"];
	        this.threshold = source["threshold"];
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.resolved_at = this.convertValues(source["resolved_at"], null);
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
	export class AlertAction {
	    type: string;
	    target: string;
	    level: string;
	
	    static createFrom(source: any = {}) {
	        return new AlertAction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.target = source["target"];
	        this.level = source["level"];
	    }
	}
	export class AlertRule {
	    id: number;
	    name: string;
	    metric: string;
	    operator: string;
	    threshold: number;
	    duration: number;
	    enabled: boolean;
	    actions: AlertAction[];
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new AlertRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.metric = source["metric"];
	        this.operator = source["operator"];
	        this.threshold = source["threshold"];
	        this.duration = source["duration"];
	        this.enabled = source["enabled"];
	        this.actions = this.convertValues(source["actions"], AlertAction);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
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
	export class ProcessTimes {
	    user: number;
	    system: number;
	    idle: number;
	    nice: number;
	    iowait: number;
	    irq: number;
	    softirq: number;
	    steal: number;
	    guest: number;
	
	    static createFrom(source: any = {}) {
	        return new ProcessTimes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user = source["user"];
	        this.system = source["system"];
	        this.idle = source["idle"];
	        this.nice = source["nice"];
	        this.iowait = source["iowait"];
	        this.irq = source["irq"];
	        this.softirq = source["softirq"];
	        this.steal = source["steal"];
	        this.guest = source["guest"];
	    }
	}
	export class ProcessInfo {
	    pid: number;
	    name: string;
	    status: string;
	    ppid: number;
	    pgid: number;
	    num_threads: number;
	    mem_usage: number;
	    mem_rss: number;
	    mem_vms: number;
	    cpu_percent: number;
	    times: ProcessTimes;
	    create_time: number;
	    cwd: string;
	    exe: string;
	    cmdline: string;
	    username: string;
	    children: number[];
	    parent?: number;
	    // Go type: time
	    timestamp: any;
	
	    static createFrom(source: any = {}) {
	        return new ProcessInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.name = source["name"];
	        this.status = source["status"];
	        this.ppid = source["ppid"];
	        this.pgid = source["pgid"];
	        this.num_threads = source["num_threads"];
	        this.mem_usage = source["mem_usage"];
	        this.mem_rss = source["mem_rss"];
	        this.mem_vms = source["mem_vms"];
	        this.cpu_percent = source["cpu_percent"];
	        this.times = this.convertValues(source["times"], ProcessTimes);
	        this.create_time = source["create_time"];
	        this.cwd = source["cwd"];
	        this.exe = source["exe"];
	        this.cmdline = source["cmdline"];
	        this.username = source["username"];
	        this.children = source["children"];
	        this.parent = source["parent"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
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
	
	export class SystemInfo {
	    hostname: string;
	    os: string;
	    platform: string;
	    platform_family: string;
	    platform_version: string;
	    architecture: string;
	    uptime: number;
	    // Go type: time
	    boot_time: any;
	    processes: number;
	    kernel_version: string;
	    kernel_arch: string;
	    // Go type: time
	    timestamp: any;
	
	    static createFrom(source: any = {}) {
	        return new SystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hostname = source["hostname"];
	        this.os = source["os"];
	        this.platform = source["platform"];
	        this.platform_family = source["platform_family"];
	        this.platform_version = source["platform_version"];
	        this.architecture = source["architecture"];
	        this.uptime = source["uptime"];
	        this.boot_time = this.convertValues(source["boot_time"], null);
	        this.processes = source["processes"];
	        this.kernel_version = source["kernel_version"];
	        this.kernel_arch = source["kernel_arch"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
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

export namespace utils {
	
	export class AlertsConfig {
	    CPUThreshold: number;
	    MemoryThreshold: number;
	    DiskThreshold: number;
	    NetworkThreshold: number;
	    EnableSounds: boolean;
	    EnableDesktop: boolean;
	    EmailEnabled: boolean;
	    EmailRecipient: string;
	    WebhookURL: string;
	
	    static createFrom(source: any = {}) {
	        return new AlertsConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CPUThreshold = source["CPUThreshold"];
	        this.MemoryThreshold = source["MemoryThreshold"];
	        this.DiskThreshold = source["DiskThreshold"];
	        this.NetworkThreshold = source["NetworkThreshold"];
	        this.EnableSounds = source["EnableSounds"];
	        this.EnableDesktop = source["EnableDesktop"];
	        this.EmailEnabled = source["EmailEnabled"];
	        this.EmailRecipient = source["EmailRecipient"];
	        this.WebhookURL = source["WebhookURL"];
	    }
	}
	export class UIConfig {
	    Theme: string;
	    Language: string;
	    WindowWidth: number;
	    WindowHeight: number;
	    WindowMaximized: boolean;
	    ShowProcessTree: boolean;
	    RefreshRate: number;
	    ShowHiddenFiles: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UIConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Theme = source["Theme"];
	        this.Language = source["Language"];
	        this.WindowWidth = source["WindowWidth"];
	        this.WindowHeight = source["WindowHeight"];
	        this.WindowMaximized = source["WindowMaximized"];
	        this.ShowProcessTree = source["ShowProcessTree"];
	        this.RefreshRate = source["RefreshRate"];
	        this.ShowHiddenFiles = source["ShowHiddenFiles"];
	    }
	}
	export class DatabaseConfig {
	    Path: string;
	    MaxConnections: number;
	    ConnectionTimeout: number;
	    EnableWAL: boolean;
	    PageSize: number;
	    CacheSize: number;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Path = source["Path"];
	        this.MaxConnections = source["MaxConnections"];
	        this.ConnectionTimeout = source["ConnectionTimeout"];
	        this.EnableWAL = source["EnableWAL"];
	        this.PageSize = source["PageSize"];
	        this.CacheSize = source["CacheSize"];
	    }
	}
	export class LoggingConfig {
	    Level: string;
	    File: string;
	    MaxSize: number;
	    MaxBackups: number;
	    MaxAge: number;
	    Compress: boolean;
	    Console: boolean;
	
	    static createFrom(source: any = {}) {
	        return new LoggingConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Level = source["Level"];
	        this.File = source["File"];
	        this.MaxSize = source["MaxSize"];
	        this.MaxBackups = source["MaxBackups"];
	        this.MaxAge = source["MaxAge"];
	        this.Compress = source["Compress"];
	        this.Console = source["Console"];
	    }
	}
	export class MonitoringConfig {
	    RefreshInterval: number;
	    MaxProcesses: number;
	    HistoryRetention: number;
	    EnableAutoRefresh: boolean;
	    CPUAlertThreshold: number;
	    MemoryAlertThreshold: number;
	    DiskAlertThreshold: number;
	
	    static createFrom(source: any = {}) {
	        return new MonitoringConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.RefreshInterval = source["RefreshInterval"];
	        this.MaxProcesses = source["MaxProcesses"];
	        this.HistoryRetention = source["HistoryRetention"];
	        this.EnableAutoRefresh = source["EnableAutoRefresh"];
	        this.CPUAlertThreshold = source["CPUAlertThreshold"];
	        this.MemoryAlertThreshold = source["MemoryAlertThreshold"];
	        this.DiskAlertThreshold = source["DiskAlertThreshold"];
	    }
	}
	export class Config {
	    Monitoring: MonitoringConfig;
	    Alerts: AlertsConfig;
	    Logging: LoggingConfig;
	    Database: DatabaseConfig;
	    UI: UIConfig;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Monitoring = this.convertValues(source["Monitoring"], MonitoringConfig);
	        this.Alerts = this.convertValues(source["Alerts"], AlertsConfig);
	        this.Logging = this.convertValues(source["Logging"], LoggingConfig);
	        this.Database = this.convertValues(source["Database"], DatabaseConfig);
	        this.UI = this.convertValues(source["UI"], UIConfig);
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

