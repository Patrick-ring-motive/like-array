/**
 * Immediately Invoked Function Expression that polyfills/extends built-in prototypes (Array, String, Set, etc.).
 */
(() => {
    /**
     * Safely invokes a function if it exists, returning undefined if it throws a ReferenceError.
     * @function
     * @param {Function} varFn - A function to invoke.
     * @returns {*} The result of varFn if it doesn't throw a ReferenceError; otherwise undefined.
     */
    const q = (varFn) => {
        try {
            return varFn?.();
        } catch (e) {
            if (e.name != "ReferenceError") {
                throw e;
            }
        }
    };

    /**
     * Derives a global object reference from the best available environment (globalThis, self, global, etc.).
     * @type {Object}
     */
    const globalObject =
        q(() => globalThis) ??
        q(() => self) ??
        q(() => global) ??
        q(() => window) ??
        this ??
        {};

    // Provide the global object under multiple names for convenience.
    for (let x of ["globalThis", "self", "global"]) {
        globalObject[x] = globalObject;
    }

    /**
     * Creates a new instance from a constructor (the first element in args) with the remaining elements as its arguments.
     * @function
     * @param {...*} args - The first element should be a constructor. The remaining are passed as constructor arguments.
     * @returns {*} A new instance if fn is valid, otherwise undefined.
     */
    const newQ = (...args) => {
        const fn = args?.shift?.();
        return fn && new fn(...args);
    };

    /**
     * Defines a property on an object with given enumerability, writability, and configurability.
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The name of the property to define.
     * @param {*} def - The property value.
     * @param {boolean} enm - If true, the property is enumerable.
     * @param {boolean} mut - If true, the property is writable and configurable.
     * @returns {Object} The modified object.
     */
    const objDoProp = function (obj, prop, def, enm, mut) {
        return Object.defineProperty(obj, prop, {
            value: def,
            writable: mut,
            enumerable: enm,
            configurable: mut,
        });
    };

    /**
     * Defines a non-enumerable, configurable property on an object.
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object} The modified object.
     */
    const objDefProp = (obj, prop, def) =>
        objDoProp(obj, prop, def, false, true);

    /**
     * Defines a non-enumerable, configurable property on an object only if it doesn't already exist.
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object|*} The modified object, or the existing property if defined.
     */
    const objNewProp = (obj, prop, def) =>
        obj[prop] ?? objDoProp(obj, prop, def, false, true);

    /**
     * Defines an enumerable, configurable property on an object.
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object} The modified object.
     */
    const objDefEnum = (obj, prop, def) =>
        objDoProp(obj, prop, def, true, true);

    /**
     * Defines a non-enumerable, non-configurable property on an object (frozen).
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object} The modified object.
     */
    const objFrzProp = (obj, prop, def) =>
        objDoProp(obj, prop, def, false, false);

    /**
     * Defines an enumerable, non-configurable property on an object (frozen).
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object} The modified object.
     */
    const objFrzEnum = (obj, prop, def) =>
        objDoProp(obj, prop, def, true, false);

    /**
     * Attempts to define a non-enumerable, configurable property; returns the error if definition fails.
     * @function
     * @param {Object} obj - The target object.
     * @param {string} prop - The property name.
     * @param {*} def - The property value.
     * @returns {Object|Error} The modified object or an error if definition fails.
     */
    const objTryProp = (obj, prop, def) => {
        try {
            return objDefProp(obj, prop, def);
        } catch (e) {
            return e;
        }
    };

    /**
     * Retrieves all own property names and symbols of an object.
     * @function
     * @param {Object} obj - The target object.
     * @returns {(string|Symbol)[]} An array of property names and symbols.
     */
    const getPropKeys = (obj) =>
        Object.getOwnPropertyNames(obj).concat(
            Object.getOwnPropertySymbols(obj),
        );

    // Prototypes for array, set, and string iterators.
    const ArrayIteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
    const SetIteratorPrototype = Object.getPrototypeOf(
        new Set()[Symbol.iterator](),
    );
    const StringIteratorPrototype = Object.getPrototypeOf(
        ""[Symbol.iterator](),
    );

    // Ensure prototypes for HTMLCollection, HTMLAllCollection, and NodeList exist.
    (globalThis.HTMLCollection ??= []).prototype ??= [];
    (globalThis.HTMLAllCollection ??= []).prototype ??= [];
    (globalThis.NodeList ??= []).prototype ??= [];

    /**
     * Converts an input to a string, favoring description/source/name if available.
     * @function
     * @param {*} x - The input to convert.
     * @returns {string} String representation of the input.
     */
    const str = (x) => String(x?.description ?? x?.source ?? x?.name ?? x);

    /**
     * Enhances the given iterable prototype with methods that attach metadata (&source, &type) to iterators.
     * @function
     * @param {Object} iterable - The prototype object (e.g. Array.prototype) to extend with custom iterators.
     */
    function sourceIterators(iterable) {
        (()=>{
        const $values = Symbol("*values");
        objDefProp(iterable, $values, iterable.values);

        objDefProp(iterable, "values", function values() {
            const iter = this[$values]();
            objDefProp(iter, "&source", this);
            objDefProp(iter, "&type", 'values');
            return iter;
        });
        objDefProp(iterable[$values],'name','*values');
        Object.setPrototypeOf(iterable.values,iterable[$values]);
        })();

        (()=>{
        const $keys = Symbol("*keys");
        iterable.keys &&
            (objDefProp(iterable, $keys, iterable.keys),
            objDefProp(iterable, "keys", function keys() {
                const iter = this[$keys]();
                objDefProp(iter, "&source", this);
                objDefProp(iter, "&type", 'keys');
                return iter;
            }));
        objDefProp(iterable[$keys],'name','*keys');
        Object.setPrototypeOf(iterable.keys,iterable[$keys]);
        })();

        (()=>{
        const $entries = Symbol("*entries");
        iterable.entries &&
            (objDefProp(iterable, $entries, iterable.entries),
            objDefProp(iterable, "entries", function entries() {
                const iter = this[$entries]();
                objDefProp(iter, "&source", this);
                objDefProp(iter, "&type", 'entries');
                return iter;
            }));
        objDefProp(iterable[$entries],'name','*entries');
        Object.setPrototypeOf(iterable.entries,iterable[$entries]);
        })();

        (()=>{
        const $iterator = Symbol("*iterator");
        iterable[Symbol.iterator] &&
            (objDefProp(iterable, $iterator, iterable[Symbol.iterator]),
            objDefProp(iterable, Symbol.iterator, function iterator() {
                const iter = this[$iterator]();
                objDefProp(iter, "&source", this);
                objDefProp(iter, "&type", 'Symbol.iterator');
                return iter;
            }));
        objDefProp(iterable[$iterator],'name','*iterator');
        Object.setPrototypeOf(iterable.iterator,iterable[$iterator]);
        })();
    }

    // Extend the prototypes of built-in iterables.
    sourceIterators(Array.prototype);
    sourceIterators(ArrayIteratorPrototype);
    sourceIterators(String.prototype);
    sourceIterators(StringIteratorPrototype);
    sourceIterators(Set.prototype);
    sourceIterators(SetIteratorPrototype);

    /**
     * Replaces the iteration methods (values, keys, entries, Symbol.iterator) to redirect them to the "&source" object if present.
     * @function
     * @param {Object} iterable - The iterator prototype to patch (e.g. ArrayIteratorPrototype).
     */
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

    /**
     * Creates a new array iterator from an existing array iterator, effectively copying its contents.
     * @function
     * @param {Iterable} arrIter - An array iterator to copy.
     * @returns {Iterable} A new array iterator with the same elements.
     */
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

    /**
     * Checks if an object is a string.
     * @function
     * @param {*} obj - The object to check.
     * @returns {boolean} True if the object is a string, otherwise false.
     */
    const isString = function isString(obj) {
        return typeof obj == "string" || obj instanceof String;
    };

    // Add certain Array.prototype methods to String.prototype and Set.prototype, etc.
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
            objDefProp(
                String.prototype[x],
                "name",
                str(x)
                    .trim(),
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
            objDefProp(Set.prototype, x, function () {
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
                    .trim(),
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
            objDefProp(HTMLCollection.prototype, x, function () {
                return [...this][x](...arguments);
            });
            objDefProp(
                HTMLCollection.prototype[x],
                "name",
                str(x)
                    .trim(),
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
                    .trim(),
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
                    .trim(),
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
                    .trim(),
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
                        .trim(),
                );
            }
        });
    });

    objDefProp(globalThis.HTMLCollection?.prototype??{},'pop',function pop(){
        objDefProp(this,'length',Math.max(this.length-1,0));
        const value = this[this.length]
        try{del(this[this.length])}catch{}
        return value;
    });

    objDefProp(globalThis.NodeList?.prototype??{},'pop',function pop(){
        objDefProp(this,'length',Math.max(this.length-1,0));
        const value = this[this.length]
        try{del(this[this.length])}catch{}
        return value;
    });

    objDefProp(globalThis.HTMLCollection?.prototype??{},'push',function push(value){
        const shim = Object.create(null);
        const length = this.length + arguments.length;
        for(let i = this.length; i !== length; i++){
        shim[i] = arguments[i];
        }
        Object.setPrototypeOf(shim,Object.getPrototypeOf(this));
        Object.setPrototypeOf(this,shim);
        objDefProp(this,'length',length);
      return  this.length;
    });

    objDefProp(globalThis.NodeList?.prototype??{},'push',function push(value){
        const shim = Object.create(null);
        const length = this.length + arguments.length;
        for(let i = this.length; i !== length; i++){
        shim[i] = arguments[i];
        }
        Object.setPrototypeOf(shim,Object.getPrototypeOf(this));
        Object.setPrototypeOf(this,shim);
        objDefProp(this,'length',length);
     return   this.length;
    });

    // Give 'Set' and 'ArrayBuffer' a length property
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

    /**
     * Adds an 'includes' function to Set.prototype that calls 'has' internally.
     */
    objDefProp(Set.prototype, "includes", function includes() {
        return this.has(...arguments);
    });

    /**
     * Adds multiple arguments to a set (basically a multi-add).
     * @function
     * @param {Set} set - The target set to modify.
     * @param {...*} args - Items to add to the set.
     * @returns {Set} The updated set.
     */
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

    /**
     * Extends the iterator prototype (like ArrayIteratorPrototype) with methods from another prototype if missing.
     * @function
     * @param {Object} proto - The source prototype to read methods from (e.g. Array.prototype).
     * @param {Object} iterProto - The iterator prototype to extend (e.g. ArrayIteratorPrototype).
     */
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
                            .trim(),
                    );
                }
            } catch {}
        });
    }
    extendIter(Array.prototype, ArrayIteratorPrototype);
    extendIter(String.prototype, StringIteratorPrototype);
    extendIter(Set.prototype, SetIteratorPrototype);

    /**
     * Patches map-like objects (Headers, FormData, URLSearchParams) to have a consistent 'clear', 'delete', 'size', etc.
     * @function
     * @param {string} proto - The name of the constructor in globalThis (e.g. "Headers").
     */
    function mapLike(proto) {
        proto = (globalThis?.[proto]??{}).prototype??{};
        objDefProp(proto, "clear", function clear() {
            for (const [key] of this) {
                this["delete"](key);
            }
        });
        (()=>{
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

    /**
     * Adds a 'getSetCookie' method that collects all 'set-cookie' headers.
     * @function
     * @param {Object} proto - The target prototype (e.g. Map.prototype).
     */
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

    /**
     * Adds a 'getAll' method that returns all values for a given key in the map-like object.
     * @function
     * @param {Object} proto - The target prototype (e.g. Headers.prototype).
     */
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