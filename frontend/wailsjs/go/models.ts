export namespace main {
	
	export class HistoricalStatus {
	    repairStatus: string;
	    statusChangeDate: string;
	
	    static createFrom(source: any = {}) {
	        return new HistoricalStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.repairStatus = source["repairStatus"];
	        this.statusChangeDate = source["statusChangeDate"];
	    }
	}
	export class Asset {
	    id: number;
	    image: number[];
	    name: sql.NullString;
	    location: sql.NullString;
	    keywords: sql.NullString;
	    brand: sql.NullString;
	    model: sql.NullString;
	    part: sql.NullString;
	    serial: sql.NullString;
	    auInventory: sql.NullString;
	    quantity: sql.NullString;
	    purchaseDate: sql.NullTime;
	    purchaseAmount: sql.NullString;
	    missing: boolean;
	    quantityMissing: sql.NullString;
	    recordLocator: number;
	    dateReportedMissing: sql.NullTime;
	    reportedMissingBy: sql.NullString;
	    notes: sql.NullString;
	    softCopyAvailable: boolean;
	    hardCopyAvailable: boolean;
	    receiptAvailable: boolean;
	    unitPrice: string;
	    vendor: string;
	    repairStatus: string;
	    statusChangeDate: sql.NullTime;
	    statusHistory: HistoricalStatus[];
	    lastCalibrationDate: sql.NullTime;
	    nextCalibrationDate: sql.NullTime;
	    calibrationHistory: string[];
	    maintenanceNotes: sql.NullString;
	
	    static createFrom(source: any = {}) {
	        return new Asset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.image = source["image"];
	        this.name = this.convertValues(source["name"], sql.NullString);
	        this.location = this.convertValues(source["location"], sql.NullString);
	        this.keywords = this.convertValues(source["keywords"], sql.NullString);
	        this.brand = this.convertValues(source["brand"], sql.NullString);
	        this.model = this.convertValues(source["model"], sql.NullString);
	        this.part = this.convertValues(source["part"], sql.NullString);
	        this.serial = this.convertValues(source["serial"], sql.NullString);
	        this.auInventory = this.convertValues(source["auInventory"], sql.NullString);
	        this.quantity = this.convertValues(source["quantity"], sql.NullString);
	        this.purchaseDate = this.convertValues(source["purchaseDate"], sql.NullTime);
	        this.purchaseAmount = this.convertValues(source["purchaseAmount"], sql.NullString);
	        this.missing = source["missing"];
	        this.quantityMissing = this.convertValues(source["quantityMissing"], sql.NullString);
	        this.recordLocator = source["recordLocator"];
	        this.dateReportedMissing = this.convertValues(source["dateReportedMissing"], sql.NullTime);
	        this.reportedMissingBy = this.convertValues(source["reportedMissingBy"], sql.NullString);
	        this.notes = this.convertValues(source["notes"], sql.NullString);
	        this.softCopyAvailable = source["softCopyAvailable"];
	        this.hardCopyAvailable = source["hardCopyAvailable"];
	        this.receiptAvailable = source["receiptAvailable"];
	        this.unitPrice = source["unitPrice"];
	        this.vendor = source["vendor"];
	        this.repairStatus = source["repairStatus"];
	        this.statusChangeDate = this.convertValues(source["statusChangeDate"], sql.NullTime);
	        this.statusHistory = this.convertValues(source["statusHistory"], HistoricalStatus);
	        this.lastCalibrationDate = this.convertValues(source["lastCalibrationDate"], sql.NullTime);
	        this.nextCalibrationDate = this.convertValues(source["nextCalibrationDate"], sql.NullTime);
	        this.calibrationHistory = source["calibrationHistory"];
	        this.maintenanceNotes = this.convertValues(source["maintenanceNotes"], sql.NullString);
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
	export class Group {
	    id: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Group(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class GroupAsset {
	    id: number;
	    name: sql.NullString;
	    location: sql.NullString;
	    serial: sql.NullString;
	    associatedBy: string;
	
	    static createFrom(source: any = {}) {
	        return new GroupAsset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = this.convertValues(source["name"], sql.NullString);
	        this.location = this.convertValues(source["location"], sql.NullString);
	        this.serial = this.convertValues(source["serial"], sql.NullString);
	        this.associatedBy = source["associatedBy"];
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
	
	export class User {
	    username: string;
	    accessLevel: number;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.accessLevel = source["accessLevel"];
	    }
	}

}

export namespace sql {
	
	export class NullString {
	    String: string;
	    Valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NullString(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.String = source["String"];
	        this.Valid = source["Valid"];
	    }
	}
	export class NullTime {
	    // Go type: time
	    Time: any;
	    Valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NullTime(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Time = this.convertValues(source["Time"], null);
	        this.Valid = source["Valid"];
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

