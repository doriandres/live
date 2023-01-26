export interface IObservable<T> {
    set value(value: T | undefined);
    get value(): T | undefined;
    subscribe(subscriber: (value: T | undefined) => void): void;
    unsubscribe(subscriber: (value: T | undefined) => void): void;
}

export interface IDisposable {
    dispose(): void;
}

export class Live<T> implements IObservable<T>{
    public static for<T>(value: T | undefined): Live<T> {
        return new Live(value);
    }

    protected _value: T | undefined;

    protected _subs: Set<(value: T | undefined) => void> = new Set();

    constructor(value: T | undefined) {
        this._value = value;
    }

    protected notify(): void {
        for (const sub of this._subs) {
            try { sub(this.value); } catch { /* IGNORE */ }
        }
    }

    public set value(value: T | undefined) {
        this._value = value;
        this.notify();
    }

    public get value(): T | undefined {
        return this._value;
    }

    public subscribe(subscriber: (value: T | undefined) => void): void {
        this._subs.add(subscriber);
        try { subscriber(this.value); } catch { /* IGNORE */ }
    }

    public unsubscribe(subscriber: (value: T | undefined) => void): void {
        this._subs.delete(subscriber);
    }
}

export class Bind<THost, TValue extends THost[keyof THost]> implements IDisposable {
    public static for<THost, TValue extends THost[keyof THost]>(host: THost, property: keyof (THost), variable: IObservable<TValue>): Bind<THost, TValue> {
        return new Bind(host, property, variable);
    }

    private _host: THost;
    private _property: keyof (THost);
    private _variable: IObservable<TValue>;
    private _listener: (value: TValue) => void;

    private listener(value: TValue): void {
        this._host[this._property] = value;
    }

    constructor(host: THost, property: keyof (THost), variable: IObservable<TValue>) {
        this._host = host;
        this._property = property;
        this._variable = variable;
        this._listener = this.listener.bind(this);
        this._variable.subscribe(this._listener);
    }

    public dispose(): void {
        this._variable.unsubscribe(this._listener);
    }
}

export class Pipe<T> extends Live<T> implements IDisposable {
    public static from<T>(variable: Live<T>, processor: (value: T | undefined) => T | undefined): Pipe<T> {
        return new Pipe(variable, processor);
    }

    private _variable: Live<T>;
    private _processor: (value: T | undefined) => T | undefined;
    private _listener: (value: T) => void;

    private listener(value: T): void {
        this.value = this._processor(value);
    }

    constructor(variable: Live<T>, processor: (value: T | undefined) => T | undefined) {
        super(undefined);
        this._variable = variable;
        this._processor = processor;
        this._listener = this.listener.bind(this);
        variable.subscribe(this._listener);
    }

    dispose(): void {
        this._variable.unsubscribe(this._listener);
    }
}


export class Spy<THost, TValue extends THost[keyof THost]> implements IObservable<TValue>, IDisposable {
    public static on<THost, TValue extends THost[keyof THost]>(host: THost, property: keyof (THost)): Spy<THost, TValue> {
        return new Spy(host, property);
    }

    private _host : THost;
    private _property: keyof (THost);    
    private _value : TValue;
    protected _subs: Set<(value: TValue | undefined) => void> = new Set();

    private get() : TValue{
        return this._value;
    }

    private set(value : TValue){
        this._value = value;
        this.notify();
    }

    private notify(): void {
        for (const sub of this._subs) {
            try { sub(this.value); } catch { /* IGNORE */ }
        }
    }

    constructor(host: THost, property: keyof (THost)){
        this._host = host;
        this._property = property;
        this._value = this._host[this._property] as TValue;        

        delete this._host[this._property];

        Object.defineProperty(host, this._property, {
            get: this.get.bind(this),
            set: this.set.bind(this),
        });
    }

    set value(value: TValue) {
        this.set(value);
    }

    get value(): TValue {
       return this.get();
    }

    public subscribe(subscriber: (value: TValue | undefined) => void): void {
        this._subs.add(subscriber);
        try { subscriber(this.value); } catch { /* IGNORE */ }
    }

    public unsubscribe(subscriber: (value: TValue | undefined) => void): void {
        this._subs.delete(subscriber);
    }

    dispose(): void {
        this._subs.clear();
        delete this._host[this._property];
        this._host[this._property] = this._value;
    }
}
