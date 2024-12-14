(() => {
    const q = (varFn) => {
        try {
            return varFn?.();
        } catch (e) {
            if (e.name != "ReferenceError") {
                throw e;
            }
        }
    };
    const globalObject =
        q(() => globalThis) ??
        q(() => self) ??
        q(() => global) ??
        q(() => window) ??
        this ??
        {};
    for (let x of ["globalThis", "self", "global"]) {
        globalObject[x] = globalObject;
    }
    const newQ = (...args) => {
        const fn = args?.shift?.();
        return fn && new fn(...args);
    };
    const objDoProp = function (obj, prop, def, enm, mut) {
        return Object.defineProperty(obj, prop, {
            value: def,
            writable: mut,
            enumerable: enm,
            configurable: mut,
        });
    };
    const objDefProp = (obj, prop, def) =>
        objDoProp(obj, prop, def, false, true);
    const objNewProp = (obj, prop, def) =>
        obj[prop] ?? objDoProp(obj, prop, def, false, true);
    const objDefEnum = (obj, prop, def) =>
        objDoProp(obj, prop, def, true, true);
    const objFrzProp = (obj, prop, def) =>
        objDoProp(obj, prop, def, false, false);
    const objFrzEnum = (obj, prop, def) =>
        objDoProp(obj, prop, def, true, false);
    const objTryProp = (obj, prop, def) => {
        try {
            return objDefProp(obj, prop, def);
        } catch (e) {
            return e;
        }
    };
    const getPropKeys = (obj) =>
        Object.getOwnPropertyNames(obj).concat(
            Object.getOwnPropertySymbols(obj),
        );
    const ArrayIteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
    const SetIteratorPrototype = Object.getPrototypeOf(
        new Set()[Symbol.iterator](),
    );
    const StringIteratorPrototype = Object.getPrototypeOf(
        ""[Symbol.iterator](),
    );
    (globalThis.HTMLCollection ??= []).prototype ??= [];
    (globalThis.HTMLAllCollection ??= []).prototype ??= [];
    (globalThis.NodeList ??= []).prototype ??= [];
    const str = (x) => String(x?.description ?? x?.source ?? x);

    function sourceIterators(iterable) {
        (()=>{
        const $values = Symbol("values");
        objDefProp(iterable, $values, iterable.values);
        objDefProp(iterable, "values", function values() {
            const iter = this[$values]();
            objDefProp(iter, "&source", this);
            return iter;
        });
        })();
        (()=>{
        const $keys = Symbol("keys");
        iterable.keys &&
            (objDefProp(iterable, $keys, iterable.keys),
            objDefProp(iterable, "keys", function keys() {
                const iter = this[$keys]();
                objDefProp(iter, "&source", this);
                return iter;
            }));
        })();
        (()=>{
        const $entries = Symbol("entries");
        iterable.entries &&
            (objDefProp(iterable, $entries, iterable.entries),
            objDefProp(iterable, "entries", function entries() {
                const iter = this[$entries]();
                objDefProp(iter, "&source", this);
                return iter;
            }));
        })();
        (()=>{
        const $iterator = Symbol("iterator");
        iterable[Symbol.iterator] &&
            (objDefProp(iterable, $iterator, iterable[Symbol.iterator]),
            objDefProp(iterable, Symbol.iterator, function iterator() {
                const iter = this[$iterator]();
                objDefProp(iter, "&source", this);
                return iter;
            }));
        })();
    }
    sourceIterators(Array.prototype);
    sourceIterators(ArrayIteratorPrototype);
    sourceIterators(String.prototype);
    sourceIterators(StringIteratorPrototype);
    sourceIterators(Set.prototype);
    sourceIterators(SetIteratorPrototype);

    function redirectIter(iterable) {
        objDefProp(iterable, "values", function values() {
            if (this["&source"]) {
                return this["&source"].values();
            }
            return this;
        });
        objDefProp(iterable, "keys", function keys() {
            if (this["&source"]) {
                return this["&source"].keys();
            }
            return this;
        });
        objDefProp(iterable, "entries", function entries() {
            if (this["&source"]) {
                return this["&source"].entries();
            }
            return this;
        });
        objDefProp(iterable, Symbol.iterator, function iterator() {
            if (this["&source"]) {
                return this["&source"][Symbol.iterator]();
            }
            return this;
        });
    }
    redirectIter(ArrayIteratorPrototype);
    redirectIter(StringIteratorPrototype);
    redirectIter(SetIteratorPrototype);
    const copyArrIter = function copyArrIter(arrIter) {
        const arr = [...arrIter];
        const newArrIter = arr.values();
        objDefProp(arrIter, "next", function next() {
            return newArrIter.next();
        });
        objDefProp(arrIter, Symbol.iterator, function iterator() {
            return newArrIter;
        });
        return arr.values();
    };
    const isString = function isString(obj) {
        return typeof obj == "string" || obj instanceof String;
    };
    getPropKeys(Array.prototype).forEach((x) => {
        if (typeof Array.prototype[x] == "function" && !String.prototype[x]) {
            objNewProp(String.prototype, x, function () {
                const arr = [...this];
                const result = arr[x](...arguments);
                if (result?.every?.((x) => isString(x))) {
                    return result.join("");
                }
                return result;
            });
            objNewProp(
                String.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
            objTryProp(Set.prototype[x], "toString", function toString() {
                return Array.prototype[x].toString();
            });
            if (Array.prototype[x][Symbol.toStringTag]) {
                objTryProp(
                    Set.prototype[x],
                    Symbol.toStringTag,
                    function toStringTag() {
                        return Array.prototype[x][Symbol.toStringTag]();
                    },
                );
            }
        }
        if (typeof Array.prototype[x] == "function" && !Set.prototype[x]) {
            objNewProp(Set.prototype, x, function () {
                const arr = [...this];
                const result = arr[x](...arguments);
                if (result instanceof Array) {
                    return new Set(result);
                }
                return result;
            });
            objDefProp(
                Set.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
            objTryProp(Set.prototype[x], "toString", function toString() {
                return Array.prototype[x].toString();
            });
            if (Array.prototype[x][Symbol.toStringTag]) {
                objTryProp(
                    Set.prototype[x],
                    Symbol.toStringTag,
                    function toStringTag() {
                        return Array.prototype[x][Symbol.toStringTag]();
                    },
                );
            }
        }
        if (
            typeof Array.prototype[x] == "function" &&
            !HTMLCollection.prototype[x]
        ) {
            objNewProp(HTMLCollection.prototype, x, function () {
                return [...this][x](...arguments);
            });
            objDefProp(
                HTMLCollection.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
        }
        if (
            typeof Array.prototype[x] == "function" &&
            !HTMLAllCollection.prototype[x]
        ) {
            objNewProp(HTMLAllCollection.prototype, x, function () {
                return [...this][x](...arguments);
            });
            objDefProp(
                HTMLAllCollection.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
        }
        if (typeof Array.prototype[x] == "function" && !NodeList.prototype[x]) {
            objNewProp(NodeList.prototype, x, function () {
                return [...this][x](...arguments);
            });
            objDefProp(
                NodeList.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
        }
        if (
            typeof Array.prototype[x] == "function" &&
            !ArrayBuffer.prototype[x]
        ) {
            objNewProp(ArrayBuffer.prototype, x, function () {
                const result = new Int8Array(this)[x](...arguments);
                return result.buffer ?? result;
            });
            objDefProp(
                ArrayBuffer.prototype[x],
                "name",
                str(x)
                    .split(/[^a-zA-Z]/)
                    .pop(),
            );
        }
        [
            "Int8Array",
            "Uint8Array",
            "Uint8ClampedArray",
            "Int16Array",
            "Uint16Array",
            "Int32Array",
            "Uint32Array",
            "Float16Array",
            "Float32Array",
            "Float64Array",
            "BigInt64Array",
            "BigUint64Array",
        ].forEach((arr) => {
            (globalThis[arr] ??= []).prototype ??= [];
            if (
                typeof Array.prototype[x] == "function" &&
                !globalThis[arr].prototype[x]
            ) {
                objNewProp(globalThis[arr].prototype, x, function () {
                    return [...this][x](...arguments);
                });
                objDefProp(
                    ArrayBuffer.prototype[x],
                    "name",
                    str(x)
                        .split(/[^a-zA-Z]/)
                        .pop(),
                );
            }
        });
    });
    Object.defineProperty(Set.prototype, "length", {
        get() {
            return this.size;
        },
        set() {},
        enumerable: false,
        configurable: true,
    });
    Object.defineProperty(ArrayBuffer.prototype, "length", {
        get() {
            return this.byteLength;
        },
        set() {},
        enumerable: false,
        configurable: true,
    });
    objDefProp(Set.prototype, "includes", function includes() {
        return this.has(...arguments);
    });
    const addAll = function addAll(set, ...args) {
        for (const arg of args) {
            set.add(arg);
        }
        return set;
    };
    objDefProp(Set.prototype, "copyWithin", function copyWithin() {
        const arr = [...this].copyWithin(...arguments);
        this.clear();
        return addAll(this, ...arr);
    });
    objDefProp(Set.prototype, "fill", function fill() {
        const arr = [...this].fill(...arguments);
        this.clear();
        return addAll(this, ...arr);
    });
    objDefProp(Set.prototype, "pop", function pop() {
        const arr = [...this];
        const item = arr.pop(...arguments);
        this.clear();
        addAll(this, ...arr);
        return item;
    });
    objDefProp(Set.prototype, "push", function push() {
        const arr = [...this];
        arr.push(...arguments);
        this.clear();
        addAll(this, ...arr);
        return this.size;
    });
    objDefProp(Set.prototype, "reverse", function reverse() {
        const arr = [...this].reverse(...arguments);
        this.clear();
        return addAll(this, ...arr);
    });
    objDefProp(Set.prototype, "shift", function shift() {
        const arr = [...this];
        const item = arr.shift(...arguments);
        this.clear();
        addAll(this, ...arr);
        return item;
    });
    objDefProp(Set.prototype, "unshift", function unshift() {
        const arr = [...this];
        arr.unshift(...arguments);
        this.clear();
        addAll(this, ...arr);
        return this.size;
    });
    objDefProp(Set.prototype, "sort", function sort() {
        const arr = [...this].sort(...arguments);
        this.clear();
        return addAll(this, ...arr);
    });
    objDefProp(Set.prototype, "splice", function splice() {
        const arr = [...this].splice(...arguments);
        this.clear();
        return addAll(this, ...arr);
    });
    objDefProp(NodeList.prototype, "namedItem", function namedItem(key) {
        return [...this].find(
            (x) =>
                x?.name == key ||
                x?.id == key ||
                x?.getAttribute?.("name") == key ||
                x?.getAttribute?.("id") == key,
        );
    });
    function extendIter(proto, iterProto) {
        Object.getOwnPropertyNames(proto).forEach((prop) => {
            try {
                if (typeof proto[prop] == "function" && !iterProto[prop]) {
                    objNewProp(iterProto, prop, function () {
                        return this["&source"][prop](...arguments);
                    });
                    objDefProp(
                        iterProto[prop],
                        "name",
                        str(prop)
                            .split(/[^a-zA-Z]/)
                            .pop(),
                    );
                }
            } catch {}
        });
    }
    extendIter(Array.prototype, ArrayIteratorPrototype);
    extendIter(String.prototype, StringIteratorPrototype);
    extendIter(Set.prototype, SetIteratorPrototype);
    //small map stuff
    function mapLike(proto) {
        proto = (globalThis?.[proto]??{}).prototype??{};
        objDefProp(proto, "clear", function clear() {
            for (const [key] of this) {
                this["delete"](key);
            }
        });
        (() => {
            const $delete = Symbol("delete");
            objDefProp(proto, $delete, proto["delete"]);
            objDefProp(proto, "delete", function _delete() {
                const bool = this.has(...arguments);
                this[$delete](...arguments);
                return bool;
            });
        })();

        Object.defineProperty(proto, "size", {
            get() {
                return [...this.keys()].length;
            },
            set() {},
            enumerable: false,
            configurable: true,
        });
    }
    mapLike("Headers");
    mapLike("FormData");
    mapLike("URLSearchParams");
    objDefProp(Map.prototype, "append", function append(key, value) {
        if (!this.has(key)) return this.set(key, value);
        return this.set(Object(key?.valueOf?.()), value);
    });
    function getSetCookie(proto) {
        objDefProp(proto, "getSetCookie", function getSetCookie() {
            const cookies = [];
            for (const [key, value] of this) {
                if (/^set-cookie$/i.test(str(key).trim())) {
                    cookies.push(value);
                }
            }
            return cookies;
        });
    }
    function getAll(proto) {
        objDefProp(proto, "getAll", function getAll(get) {
            const all = [];
            for (const [key, value] of this) {
                if (get?.valueOf?.() == key?.valueOf?.()) {
                    all.push(value);
                }
            }
            return all;
        });
    }
    getSetCookie(Map.prototype);
    getSetCookie(globalThis?.FormData?.prototype??{});
    getAll(Map.prototype);
    getAll(globalThis?.Headers?.prototype??{});
    objDefProp(
        globalThis?.FormData?.prototype??{},
        "forEach",
        function forEach() {
            return new Map(this).forEach(...arguments);
        },
    );
  [
    'Map',
    'Headers',
    'FormData'
    ].forEach(mapLike=>{
                    (globalThis[mapLike]?.prototype??{}).sort = function sort(){
                                    const arr = [...this.entries()].sort((a,b)=>{
                                                    const aKey = String(a?.[0]);
                                                    const bKey = String(b?.[0]);
                                                    if(aKey > bKey)return 1;
                                                    if(bKey > aKey)return -1;
                                                    const aValue = String(a?.[1]);
                                                    const bValue = String(b?.[1]);
                                                    if(aValue > bValue)return 1;
                                                    if(bValue > aValue)return -1;
                                                    return 0 ;
                                    });
                                    this.clear();
                                    arr.forEach(x=>{
                                                    (this.append ?? this.set)(x?.[0],x?.[1]);
                                    });
                                    return this;
                    };
    });



    
})();
