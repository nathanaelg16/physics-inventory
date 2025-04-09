export namespace main {
	
	export class Asset {
	    id: number;
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
	
	    static createFrom(source: any = {}) {
	        return new Asset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
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

