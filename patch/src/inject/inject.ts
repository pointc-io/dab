function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

let secretID = generateUUID() + generateUUID();

var actualCode = `
(${function (device: any) {
  console.log("Jumper Fingerprint Patch Content-Script");

  let isFirefox = window.hasOwnProperty('mozInnerScreenX');
  let isChrome = window.hasOwnProperty('chrome');
  let isOpera = window.hasOwnProperty('opera');
  let isEdge = false;
  let isSafari = false;

  // Function map.
  let interceptorMap = new WeakMap<any, FunctionInterceptor>();
  let interceptorGetterMap = new WeakMap<any, any>();

  // Secret.
  let secretID = device.id;
  delete device.id;

  // proxy.
  let proxy: (func: any) => () => any = device['proxy'];
  delete device.proxy;

  function objectIsAscending(): boolean {
    let obj = {};
    obj['z'] = '';
    obj['a'] = '';

    let names = Object.getOwnPropertyNames(obj);

    return names[0] == 'z';
  }

  let objectAscending = objectIsAscending();

  function toNameArray(list: {}) {
    let arr = Array<string>();
    for (let p in list) {
      arr.push(p);
    }
    return arr;
  }

  // Proto map.
  let protoMap = new WeakMap<any, any>();

  let originalGetOwnPropertyDescriptors = Object['getOwnPropertyDescriptors'];
  let originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  let originalGetOwnPropertyNames = Object.getOwnPropertyNames;
  let originalFunctionToString = Function.prototype.toString;
  let toSource = Object.prototype['toSource'];

  class ProtoDef {
    public names: string[];
    public descriptors: any;
    public descriptorMap = new WeakMap<any, any>();

    constructor(public proto: any) {
      this.names = originalGetOwnPropertyNames(proto);
      this.descriptors = originalGetOwnPropertyDescriptors(proto);

      protoMap.set(proto, this);
    }

    hasOwnProperty(name: string): boolean {
      return this.proto.hasOwnProperty(name);
    }

    getOwnPropertyNames(): string[] {
      return originalGetOwnPropertyNames(this.proto);
    }

    getOwnPropertyDescriptor(name: string) {
      return originalGetOwnPropertyDescriptor(this.proto, name);
    }

    propertyIsEnumerable(name: string) {
      return this.proto.propertyIsEnumerable(name);
    }

    getOwnPropertyDescriptors() {
      let names = this.getOwnPropertyNames();
      let descriptors = {};

      for (let i = 0; i < names.length; i++) {
        let name = names[i];

        descriptors[name] = originalGetOwnPropertyDescriptor(this.proto, name);
      }

      return descriptors;
    }
  }


  let navigatorDef = new ProtoDef(Navigator.prototype);
  let screenDef = new ProtoDef(Screen.prototype);
  let functionStaticDef = new ProtoDef(window['Function']);
  let functionDef = new ProtoDef(Function.prototype);
  let objectStaticDef = new ProtoDef(window['Object']);
  let objectDef = new ProtoDef(Object.prototype);

  /**
   *
   */
  interface FunctionProxy {
    proto: ProtoDef;
    propertyName: string;
    originalDescriptor: PropertyDescriptor;
    wrapper: any;
    original: any;

    propertyDescriptors(): {};

    toSource(): string;

    toString(): string;

    apply(thisArg: any, argArray?: any): any;
  }

  /**
   *
   */
  class FunctionInterceptor implements FunctionProxy {
    public originalDescriptor: any;
    public wrapper: any;

    constructor(public proto: ProtoDef,
                public propertyName: string,
                public original: any) {
      this.originalDescriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
    }

    propertyDescriptors(): {} {

      return {};
    }

    toSource(): string {
      return this.original.toSource();
    }

    toString(): string {
      return this.original.toString();
    }

    apply(thisArg: any, argArray?: any): any {
      return this.original.apply(thisArg, argArray);
    }

    init(wrapper: any) {
      interceptorMap.set(wrapper, this);
      this.wrapper = wrapper;

      let nameDescriptor = originalGetOwnPropertyDescriptor(wrapper, 'name');

      // if (nameDescriptor) {
      //   // Map name.
      //   Object.defineProperty(wrapper, 'name', {
      //     value: this.original['name'],
      //     writable: nameDescriptor.writable,
      //     enumerable: nameDescriptor.enumerable,
      //     configurable: nameDescriptor.configurable
      //   });
      // } else {
      //   Object.defineProperty(wrapper, 'name', {
      //     value: this.original['name'],
      //     writable: false,
      //     enumerable: false,
      //     configurable: true
      //   });
      // }

      for (let prop in wrapper) {
        switch (prop) {
          case 'name':
            // if (nameDescriptor) {
            //   // Map name.
            //   Object.defineProperty(wrapper, 'name', {
            //     value: this.original['name'],
            //     writable: nameDescriptor.writable,
            //     enumerable: nameDescriptor.enumerable,
            //     configurable: nameDescriptor.configurable
            //   });
            // } else {
            //   Object.defineProperty(wrapper, 'name', {
            //     value: this.original['name'],
            //     writable: false,
            //     enumerable: false,
            //     configurable: true
            //   });
            // }
            break;

          default:
            Object.defineProperty(wrapper, prop, Object.getOwnPropertyDescriptor(wrapper, prop));
            break;
        }
      }
    }
  }

  /**
   * Patch up Function.prototype.toString so the source doesn't leak.
   */
  class FunctionToString extends FunctionInterceptor {
    constructor(public proto: any, propertyName: string, public original: any) {
      super(proto, propertyName, original);
    }

    apply(thisArg: any, argArray?: any): any {
      console.log('FunctionToString');
      // console.log(thisArg);

      let interceptor = interceptorMap.get(thisArg);
      if (interceptor) {
        return interceptor.toString();
      }

      let getterInterceptor = interceptorGetterMap.get(thisArg);
      if (getterInterceptor) {
        return getterInterceptor.toString();
      }

      return this.original.apply(thisArg);
    }
  }

  /**
   * Patch up Function.prototype.toSource so the source doesn't leak.
   * Currently only Firefox implemented 'toSource'.
   */
  class FunctionToSource extends FunctionInterceptor {

    constructor(public proto: any, propertyName: string, public original: any) {
      super(proto, propertyName, original);
    }

    apply(thisArg: any, argArray?: any): any {

      let interceptor = interceptorMap.get(thisArg);
      if (interceptor) {
        return interceptor.toSource();
      }

      let getterInterceptor = interceptorGetterMap.get(thisArg);
      if (getterInterceptor) {
        // console.log(getterInterceptor); 
        return getterInterceptor.toSource();
      }

      return this.original.apply(thisArg, argArray);
    }
  }

  /**
   *
   */
  class GetOwnPropertyNames extends FunctionInterceptor {

    constructor(public proto: any, propertyName: string, public original: any) {
      super(proto, propertyName, original);
    }

    apply(thisArg: any, argArray?: any): any {
      let originalValue = this.original.apply(thisArg, argArray);

      let interceptor = interceptorMap.get(argArray[0]);
      if (interceptor) {
        console.log('Getter getOwnPropertyNames');

        return originalGetOwnPropertyNames(interceptor.original);
      }

      let getterInterceptor = interceptorGetterMap.get(argArray[0]);
      if (getterInterceptor) {
        return originalGetOwnPropertyNames(getterInterceptor.original);
      }

      return originalValue;
    }
  }

  /**
   *
   */
  class GetOwnPropertyDescriptors extends FunctionInterceptor {
    constructor(public proto: any,
                public propertyName: string,
                public original: any) {
      super(proto, propertyName, original);
    }

    apply(thisArg: any, argArray?: any): any {
      let originalValue = this.original.apply(thisArg, argArray);
      let interceptor = interceptorMap.get(argArray[0]);

      if (interceptor) {
        //
        let names = originalGetOwnPropertyNames(interceptor.original);

        let descriptors = {};

        if (objectAscending) {
          console.log('Ascending');
          for (let i = 0; i < names.length; i++) {
            let name = names[i];
            descriptors[name] = originalGetOwnPropertyDescriptor(argArray[0], name);
          }
        } else {
          console.log('Descending');
          for (let i = names.length - 1; i > -1; i--) {
            let name = names[i];
            descriptors[name] = originalGetOwnPropertyDescriptor(argArray[0], name);
          }
        }
        return descriptors;
      }

      return originalValue;
    }
  }

  /**
   *
   */
  class HasOwnProperty extends FunctionInterceptor {
    constructor(public proto: any, propertyName: string, public original: any) {
      super(proto, propertyName, original);
    }

    apply(thisArg: any, argArray?: any): any {
      // console.log('HasOwnProperty');

      let originalValue = this.original.apply(thisArg, argArray);

      let maybeIntercept = interceptorMap.get(thisArg);
      if (maybeIntercept) {
        return this.original.apply(maybeIntercept.original);
      }

      return originalValue;
    }


    init(wrapper: any): any {
      let val = super.init(wrapper);

      return val;
    }
  }


  /**
   * Convenience class to iterate through a prototype's own properties
   * and override them if desired.
   */
  abstract class PropertyBuilder {
    public proto: any;
    public name: string;
    public descriptor: PropertyDescriptor;

    constructor(public protoDef: ProtoDef) {
      this.proto = protoDef.proto;
    }

    build() {
      let names = originalGetOwnPropertyNames(this.proto);

      for (let i = 0; i < names.length; i++) {
        this.name = names[i];
        this.descriptor = originalGetOwnPropertyDescriptor(this.proto, this.name);
        // console.log(this.descriptor);

        let newDescriptor = this.buildDescriptor();

        try {
          Object.defineProperty(this.proto, this.name, newDescriptor);
        } catch (e) {
        }
      }
    }

    buildDescriptor(): PropertyDescriptor {
      if (this.descriptor.get) {
        let interceptor = this.getter(this.name, this.descriptor);

        if (!interceptor) {
          return this.descriptor;
        }

        interceptor.init(this.protoDef, this.name, this.descriptor);
        return interceptor.descriptor;
      } else {
        return this.descriptor;
      }
    }

    abstract getter(name: string, descriptor: PropertyDescriptor): PropertyInterceptor | null;
  }

  /**
   *
   * @param {PropertyDescriptor} from
   * @param {PropertyDescriptor} to
   * @returns {PropertyDescriptor}
   */
  function mimic(from: PropertyDescriptor, to: PropertyDescriptor): PropertyDescriptor {
    let fromNames = originalGetOwnPropertyNames(from);
    let toNames = originalGetOwnPropertyNames(to);

    var create = false;

    if (fromNames && !toNames) {
      create = true;
    } else if (!fromNames && toNames) {
      create = true;
    } else if (fromNames.length != toNames.length) {
      create = true;
    } else {
      for (let i = 0; i < fromNames.length; i++) {
        if (fromNames[i] !== toNames[i]) {
          create = true;
          break;
        }
      }
    }

    if (!create) {
      return to;
    }

    let toProps = originalGetOwnPropertyDescriptors(to);
    let newDescriptor: PropertyDescriptor = {};

    for (let i = 0; i < fromNames.length; i++) {
      let name = fromNames[i];
      let toProp = toProps[name];

      if (toProp) {
        newDescriptor[name] = toProp;
      }
    }

    return to;
  }


  /**
   * Untraceable property interceptor.
   */
  abstract class PropertyInterceptor {
    public hasGetter = false;
    public hasSetter = false;
    public hasValue = false;
    public original: any;
    public protoDef: ProtoDef;
    public proto: any;
    public name: string;
    public originalDescriptor: PropertyDescriptor;
    public descriptor: PropertyDescriptor;
    public shim: any;
    public self: any;

    constructor(public valueProvider: () => any) {
      this.self = this;
    }

    init(protoDef: ProtoDef,
         name: string,
         originalDescriptor: PropertyDescriptor) {
      // Set props.
      this.protoDef = protoDef;
      this.proto = protoDef.proto;
      this.name = name;
      this.originalDescriptor = originalDescriptor;

      this.hasGetter = !!originalDescriptor.get;
      this.hasSetter = !!originalDescriptor.set;
      this.hasValue = !!originalDescriptor.value;

      if (this.hasGetter) {
        this.original = originalDescriptor.get;
      } else if (this.hasValue) {
        this.original = originalDescriptor.value;
      } else {
        // Do nothing.
        // This shouldn't happen.
      }

      // Create shim.
      this.shim = this.create(this);

      // Wire it up.
      this.wire();
    }

    abstract create(self: PropertyInterceptor): any;

    wire() {
      // Create descriptor.
      // Just hijack it off the shim.
      this.descriptor = Object.getOwnPropertyDescriptor(this.shim, this.name);

      // Register with global WeakMap.
      interceptorGetterMap.set(this.descriptor.get, this);

      // Define Property on the prototype.
      Object.defineProperty(this.protoDef.proto, this.name, this.descriptor);
    }

    apply(thisArg: any, argArray?: any): any {
      this.original.apply(thisArg);
      return this.valueProvider();
    }

    toString() {
      // Map toString to the original function.
      return this.original.toString();
    }

    toSource() {
      // Map toSource to the original function.
      return this.original.toSource();
    }

    propertyDescriptors(): {} {
      return this.protoDef.descriptors;
    }
  }

  class ToStringProperty extends PropertyInterceptor {

    constructor(valueProvider: () => any) {
      super(valueProvider);
    }

    create(self: PropertyInterceptor): any {
      return {
        toString(): string {
          return self.apply(this);
        }
      };
    }

    apply(thisArg: any, argArray?: any): any {
      let interceptor = interceptorGetterMap.get(thisArg);
      if (interceptor && interceptor !== self) {
        return interceptor.original.toString.apply(thisArg);
      }

      return this.original.apply(thisArg);
    }
  }

  // let systemColors = {};
  //
  // class GetComputedStyles extends AbstractFunctionProxy {
  //   constructor(public proto: any, propertyName: string, public original: any) {
  //     super(proto, propertyName, original);
  //   }
  //
  //   apply(thisArg: any, argArray?: any): any {
  //     console.log('HasOwnProperty');
  //
  //     var elem = argArray[0];
  //     var pseudoElt = argArray[1];
  //
  //     if (!elem) {
  //       return null;
  //     }
  //
  //     var systemColors = ["ActiveBorder", "ActiveCaption", "AppWorkspace", "Background", "ButtonFace", "ButtonHighlight", "ButtonShadow", "ButtonText", "CaptionText", "GrayText", "Highlight", "HighlightText", "InactiveBorder", "InactiveCaption", "InactiveCaptionText", "InfoBackground", "InfoText", "Menu", "MenuText", "Scrollbar", "ThreeDDarkShadow", "ThreeDFace", "ThreeDHighlight", "ThreeDLightShadow", "ThreeDShadow", "Window", "WindowFrame", "WindowText"];
  //     var cssProps = ["color", "background", "backgroundColor", "border", "borderColor", "borderTop", "borderLeft", "borderRight", "borderBottom", "borderTopColor", "borderLeftColor", "borderRightColor", "borderBottomColor"];
  //     var propsWithSystemColor = {};
  //
  //     var whitespaceRegExp = /\s+/g;
  //
  //     for (var j = 0; j < cssProps.length; j++) {
  //       var cssProp = cssProps[j];
  //       var value = elem.style.getPropertyValue(cssProp);
  //       if (!value) continue;
  //
  //       var valueStr = value.toString().toLowerCase();
  //       var parts = valueStr.split(whitespaceRegExp);
  //
  //       for (var i = 0; i < systemColors.length; i++) {
  //         var systemColor = systemColors[i];
  //         var systemColorLower = systemColor.toLowerCase();
  //
  //         for (var m = 0; m < parts.length; m++) {
  //           if (parts[m] == systemColorLower) {
  //             propsWithSystemColor[cssProp] = systemColors[systemColor];
  //             break;
  //           }
  //         }
  //       }
  //     }
  //
  //     var computedStyle = this.original.apply(this, elem, pseudoElt);
  //
  //     if (computedStyle.getPropertyCSSValue) {
  //       computedStyle.getPropertyCSSValue = intercept(computedStyle.getPropertyCSSValue, function (ctx) {
  //         var propertyName = ctx.arguments.length > 0 ? ctx.arguments[0] : "";
  //         return ctx.original.call(this, propertyName);
  //       });
  //     }
  //
  //     computedStyle.getPropertyValue = intercept(computedStyle.getPropertyValue, function (ctx) {
  //       var propertyName = ctx.arguments.length > 0 ? ctx.arguments[0] : "";
  //       if (propsWithSystemColor) {
  //         var rgbPattern = /[rR][gG][bB][aA]?[\s]*[(]([\s]*[\d]+[\s]*[,]){1,3}[\s]*[\d]+[\s]*[)]/g;
  //
  //         for (var y in propsWithSystemColor) {
  //           if (y != propertyName) {
  //             continue;
  //           }
  //           var computedStyleProp = ctx.original.call(this, propertyName);
  //           var rgbValue = propsWithSystemColor[y];
  //           return computedStyleProp.replace(rgbPattern, rgbValue);
  //         }
  //       }
  //       return ctx.original.call(this, propertyName);
  //     });
  //
  //     return originalValue;
  //   }
  // }

  /*****************************************************************************/
  // Function overrides
  /*****************************************************************************/

  /**
   *
   * @param {ProtoDef} staticFunctionDef
   * @param {ProtoDef} functionDef
   */
  function patchFunction(staticFunctionDef: ProtoDef, functionDef: ProtoDef) {
    let names = originalGetOwnPropertyNames(functionDef.proto);

    for (let i = 0; i < names.length; i++) {
      let propertyName = names[i];

      switch (propertyName) {
        case 'toString':
          let functionToString = new FunctionToString(functionDef, propertyName, functionDef.proto.toString);
          let toStringDescriptor = originalGetOwnPropertyDescriptor(functionDef.proto, propertyName);

          Object.defineProperty(
              functionDef.proto,
              propertyName,
              {
                value: proxy(functionToString),
                writable: toStringDescriptor.writable,
                enumerable: toStringDescriptor.enumerable,
                configurable: toStringDescriptor.configurable
              }
          );
          break;

        case 'toSource':
          // Only Firefox supports this method.
          if (toSource) {
            let originalToSource = functionDef.proto[propertyName];
            let toSourceDescriptor = originalGetOwnPropertyDescriptor(functionDef.proto, propertyName);
            let functionToSource = new FunctionToSource(functionDef, propertyName, originalToSource);

            Object.defineProperty(
                functionDef.proto,
                propertyName,
                {
                  value: proxy(functionToSource),
                  writable: toSourceDescriptor.writable,
                  enumerable: toSourceDescriptor.enumerable,
                  configurable: toSourceDescriptor.configurable
                }
            );
          }
          break;

        default:
          try {
            Object.defineProperty(
                functionDef.proto,
                propertyName,
                originalGetOwnPropertyDescriptor(functionDef.proto, propertyName)
            );
          } catch (e) {
          }
          break;
      }
    }
  }

  /*****************************************************************************/
  // Object overrides
  /*****************************************************************************/

  /**
   *
   * @param {ProtoDef} staticObjectDef
   * @param {ProtoDef} objectDef
   */
  function patchObject(staticObjectDef: ProtoDef, objectDef: ProtoDef) {
    let hasOwnProperty = new HasOwnProperty(
        objectDef,
        'hasOwnProperty',
        objectDef.proto.hasOwnProperty
    );
    let hasOwnPropertyDescriptor = originalGetOwnPropertyDescriptor(objectDef.proto, 'hasOwnProperty');

    // Static functions
    let getOwnPropertyNames = new GetOwnPropertyNames(
        staticObjectDef,
        'getOwnPropertyNames',
        staticObjectDef.proto['getOwnPropertyNames']
    );
    let getOwnPropertyNamesDescriptor = originalGetOwnPropertyDescriptor(
        staticObjectDef.proto,
        'getOwnPropertyNames'
    );

    // Fix getOwnPropertyDescriptors.
    let getOwnPropertyDescriptors = new GetOwnPropertyDescriptors(
        staticObjectDef,
        'getOwnPropertyDescriptors',
        staticObjectDef.proto['getOwnPropertyDescriptors']
    );
    let getOwnPropertyDescriptorsDescriptor = originalGetOwnPropertyDescriptor(
        staticObjectDef.proto,
        'getOwnPropertyDescriptors'
    );

    let names = originalGetOwnPropertyNames(objectDef.proto);

    for (let i = 0; i < names.length; i++) {
      let p = names[i];

      switch (p) {
        case 'hasOwnProperty':
          try {
            // setProp(objectProto.proto, p, proxy(hasOwnProperty));
            // objectDef.proto['hasOwnProperty'] = proxy(hasOwnProperty);
            Object.defineProperty(
                objectDef.proto,
                'hasOwnProperty',
                {
                  value: proxy(hasOwnProperty),
                  writable: hasOwnPropertyDescriptor.writable,
                  enumerable: hasOwnPropertyDescriptor.enumerable,
                  configurable: hasOwnPropertyDescriptor.configurable
                }
            );

            // console.log(objectDef.proto.hasOwnProperty);
          } catch (e) {
            // console.log(e);
          }
          break;

        default:
          try {
            Object.defineProperty(
                objectDef.proto,
                p,
                originalGetOwnPropertyDescriptor(objectDef.proto, p)
            );
          } catch (e) {
          }
          break;
      }
    }

    let staticNames = originalGetOwnPropertyNames(staticObjectDef.proto);

    for (let i = 0; i < staticNames.length; i++) {
      let p = staticNames[i];

      switch (p) {
        case 'getOwnPropertyNames':
          Object.defineProperty(
              staticObjectDef.proto,
              p,
              {
                value: proxy(getOwnPropertyNames),
                writable: getOwnPropertyNamesDescriptor.writable,
                enumerable: getOwnPropertyNamesDescriptor.enumerable,
                configurable: getOwnPropertyNamesDescriptor.configurable
              }
          );
          break;

        case 'getOwnPropertyDescriptors':
          Object.defineProperty(
              staticObjectDef.proto,
              p,
              {
                value: proxy(getOwnPropertyDescriptors),
                writable: getOwnPropertyDescriptorsDescriptor.writable,
                enumerable: getOwnPropertyDescriptorsDescriptor.enumerable,
                configurable: getOwnPropertyDescriptorsDescriptor.configurable
              }
          );
          break;

        default:
          try {
            Object.defineProperty(
                staticObjectDef.proto,
                p,
                originalGetOwnPropertyDescriptor(staticObjectDef.proto, p)
            );
          } catch (e) {
          }
          break;
      }
    }
  }


  /*****************************************************************************/
  // Screen
  /*****************************************************************************/

  class AvailWidthGetter extends PropertyInterceptor {

    constructor(value: number) {
      super(() => value);
    }

    create(self: PropertyInterceptor) {
      return {
        get availWidth() {
          return self.apply(this);
        }
      };
    }
  }

  class AvailHeightGetter extends PropertyInterceptor {

    constructor(value: number) {
      super(() => value);
    }

    create(self: PropertyInterceptor) {
      return {
        get availHeight() {
          return self.apply(this);
        }
      };
    }
  }

  class WidthGetter extends PropertyInterceptor {

    constructor(value: number) {
      super(() => value);
    }

    create(self: PropertyInterceptor) {
      return {
        get width() {
          return self.apply(this);
        }
      };
    }
  }

  class HeightGetter extends PropertyInterceptor {

    constructor(value: number) {
      super(() => value);
    }

    create(self: PropertyInterceptor) {
      return {
        get height() {
          return self.apply(this);
        }
      };
    }
  }

  /**
   *
   * @param {ProtoDef} protoDef
   */
  function patchScreen(protoDef: ProtoDef) {
    class Builder extends PropertyBuilder {
      constructor(protoDef: ProtoDef) {
        super(protoDef);
      }

      getter(name: string, descriptor: PropertyDescriptor): PropertyInterceptor | any {
        switch (name) {
          case 'availWidth':
            return new AvailWidthGetter(621);

          case 'availHeight':
            return new AvailHeightGetter(622);

          case 'width':
            return new WidthGetter(721);

          case 'height':
            return new HeightGetter(722);

          default:
            return null;
        }
      }
    }

    new Builder(protoDef).build();
  }


  /*****************************************************************************/
  // Navigator
  /*****************************************************************************/

  class UserAgentGetter extends PropertyInterceptor {

    constructor(valueProvider: () => any) {
      super(valueProvider);
    }

    create(self: PropertyInterceptor) {
      return {
        get userAgent() {
          return self.apply(this);
        }
      };
    }
  }

  class AppVersionGetter extends PropertyInterceptor {

    constructor(valueProvider: () => any) {
      super(valueProvider);
    }

    create(self: PropertyInterceptor) {
      return {
        get appVersion() {
          return self.apply(this);
        }
      };
    }
  }

  class AppCodeNameGetter extends PropertyInterceptor {

    constructor(valueProvider: () => any) {
      super(valueProvider);
    }

    create(self: PropertyInterceptor) {
      return {
        get appCodeName() {
          return self.apply(this);
        }
      };
    }
  }

  /**
   *
   * @param {ProtoDef} protoDef
   */
  function patchNavigator(protoDef: ProtoDef) {
    class Builder extends PropertyBuilder {
      constructor(protoDef: ProtoDef) {
        super(protoDef);
      }

      getter(name: string, descriptor: PropertyDescriptor): PropertyInterceptor | any {
        // TODO: Below are just placeholders until the yet to be finalized model can be wired.
        switch (name) {
          case 'userAgent':
            return new UserAgentGetter(() => ' <=> Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.3163.100 Safari/537.36');

          case 'appVersion':
            return new AppVersionGetter(() => 'MyApp');

          case 'appCodeName':
            return new AppCodeNameGetter(() => 'Modzilla');

          default:
            return null;
        }
      }
    }

    new Builder(protoDef).build();
  }


  /**
   *
   * @param {ProtoDef} protoDef
   */
  function patchWebGL(protoDef: ProtoDef) {

  }

  function patchCanvas(protoDef: ProtoDef) {

  }

  function patchSystemColors(protoDef: ProtoDef) {

  }

  function patchTimeZone() {

  }

  function patchIntl() {
    // Adjust time-zone.
  }

  function patchWebRTC() {

  }

  /*****************************************************************************/
  // Apply Patches
  /*****************************************************************************/

  // Patch function.
  // patchFunction(functionStaticDef, functionDef);
  // Patch Object.
  // patchObject(objectStaticDef, objectDef);
  // Patch screen.
  patchScreen(screenDef);
  // Patch navigator.
  patchNavigator(navigatorDef);


  // /************************************************************************/
  // /************************************************************************/
  // // WebGL getSupportedExtensions
  // /************************************************************************/
  // /************************************************************************/
  // var webGLExtensions = [];
  // if (device.webGLExtensions) {
  //   for (var i = 0; i < device.webGLExtensions.length; i++) {
  //     webGLExtensions.push(device.webGLExtensions[i].name);
  //   }
  // }
  // WebGLRenderingContext.prototype.getSupportedExtensions = intercept(WebGLRenderingContext.prototype.getSupportedExtensions, function (context) {
  //   return webGLExtensions;
  // });
  //
  //
  // /************************************************************************/
  // /************************************************************************/
  // // WebGL getParameter
  // /************************************************************************/
  // /************************************************************************/
  // WebGLRenderingContext.prototype.getParameter = intercept(WebGLRenderingContext.prototype.getParameter, function (context) {
  //   var id = context.arguments[0];
  //   var webgl = context.device.webGL;
  //
  //   if (id == this.ALPHA_BITS) {
  //     return webgl.alphaBits;
  //   }
  //   if (id == this.BLUE_BITS) {
  //     return webgl.blueBits;
  //   }
  //   if (id == this.DEPTH_BITS) {
  //     return webgl.depthBits;
  //   }
  //   if (id == this.GREEN_BITS) {
  //     return webgl.greenBits;
  //   }
  //   if (id == this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) {
  //     return webgl.maxCombinedTextureImageUnits;
  //   }
  //   if (id == this.MAX_CUBE_MAP_TEXTURE_SIZE) {
  //     return webgl.maxCubeMapTextureSize;
  //   }
  //   if (id == this.MAX_FRAGMENT_UNIFORM_VECTORS) {
  //     return webgl.maxFragmentUniformVectors;
  //   }
  //   if (id == this.MAX_RENDERBUFFER_SIZE) {
  //     return webgl.maxRenderBufferSize;
  //   }
  //   if (id == this.MAX_TEXTURE_IMAGE_UNITS) {
  //     return webgl.maxTextureImageUnits;
  //   }
  //   if (id == this.MAX_TEXTURE_SIZE) {
  //     return webgl.maxTextureSize;
  //   }
  //   if (id == this.MAX_VARYING_VECTORS) {
  //     return webgl.maxVaryingVectors;
  //   }
  //   if (id == this.MAX_VERTEX_ATTRIBS) {
  //     return webgl.maxVertexAttribs;
  //   }
  //   if (id == this.MAX_VERTEX_TEXTURE_IMAGE_UNITS) {
  //     return webgl.maxVertexTextureImageUnits;
  //   }
  //   if (id == this.MAX_VERTEX_UNIFORM_VECTORS) {
  //     return webgl.maxVertexUniformVectors;
  //   }
  //   if (id == this.RED_BITS) {
  //     return webgl.redBits;
  //   }
  //   if (id == this.RENDERER) {
  //     return webgl.renderer;
  //   }
  //   if (id == this.SHADING_LANGUAGE_VERSION) {
  //     return webgl.shadingLanguageVersion;
  //   }
  //   if (id == this.STENCIL_BITS) {
  //     return webgl.stencilBits;
  //   }
  //   if (id == this.VENDOR) {
  //     return webgl.vendor;
  //   }
  //   if (id == this.VERSION) {
  //     return webgl.version;
  //   }
  //   if (id == this.MAX_VIEWPORT_DIMS) {
  //     return [webgl.maxViewportWidth, webgl.maxViewportHeight];
  //   }
  //   if (id == this.ALIASED_LINE_WIDTH_RANGE) {
  //     return [webgl.aliasedLineWidthRangeLow, webgl.aliasedLineWidthRangeHigh];
  //   }
  //   if (id == this.ALIASED_POINT_SIZE_RANGE) {
  //     return [webgl.aliasedPointSizeRangeLow, webgl.aliasedPointSizeRangeHigh];
  //   }
  //   var ext = this.getExtension("EXT_texture_filter_anisotropic") || this.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || this.getExtension("MOZ_EXT_texture_filter_anisotropic");
  //   if (ext) {
  //     if (id == ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) {
  //       return webgl.maxAnisotropy;
  //     }
  //   }
  //
  //   ext = this.getExtension("WEBGL_debug_renderer_info");
  //   if (ext) {
  //     if (id == ext.UNMASKED_VENDOR_WEBGL) {
  //       return webgl.unmaskedVendor;
  //     }
  //     if (id == ext.UNMASKED_RENDERER_WEBGL) {
  //       return webgl.unmaskedRenderer;
  //     }
  //   }
  //
  //   return context.original.call(this, id);
  // });
  //
  //
  // /************************************************************************/
  // /************************************************************************/
  // // WebGL getShaderPrecisionFormat
  // /************************************************************************/
  // /************************************************************************/
  // WebGLRenderingContext.prototype.getShaderPrecisionFormat = intercept(WebGLRenderingContext.prototype.getShaderPrecisionFormat, function (context) {
  //   var shaderType = context.arguments[0];
  //   var precisionType = context.arguments[1];
  //   var webgl = context.device.webGL;
  //
  //   if (shaderType == this.VERTEX_SHADER) {
  //     if (precisionType == this.HIGH_FLOAT) {
  //       return webgl.vertexShaderHighFloat;
  //     }
  //     if (precisionType == this.MEDIUM_FLOAT) {
  //       return webgl.vertexShaderMediumFloat;
  //     }
  //     if (precisionType == this.LOW_FLOAT) {
  //       return webgl.vertexShaderLowFloat;
  //     }
  //     if (precisionType == this.HIGH_INT) {
  //       return webgl.vertexShaderHighInt;
  //     }
  //     if (precisionType == this.MEDIUM_INT) {
  //       return webgl.vertexShaderMediumInt;
  //     }
  //     if (precisionType == this.LOW_INT) {
  //       return webgl.vertexShaderLowInt;
  //     }
  //   } else if (shaderType == this.FRAGMENT_SHADER) {
  //     if (precisionType == this.HIGH_FLOAT) {
  //       return webgl.fragmentShaderHighFloat;
  //     }
  //     if (precisionType == this.MEDIUM_FLOAT) {
  //       return webgl.fragmentShaderMediumFloat;
  //     }
  //     if (precisionType == this.LOW_FLOAT) {
  //       return webgl.fragmentShaderLowFloat;
  //     }
  //     if (precisionType == this.HIGH_INT) {
  //       return webgl.fragmentShaderHighInt;
  //     }
  //     if (precisionType == this.MEDIUM_INT) {
  //       return webgl.fragmentShaderMediumInt;
  //     }
  //     if (precisionType == this.LOW_INT) {
  //       return webgl.fragmentShaderLowInt;
  //     }
  //   }
  //   return context.original.call(this, shaderType, precisionType);
  // });
  //
  //
  // /************************************************************************/
  // /************************************************************************/
  // // Canvas toDataURL
  // /************************************************************************/
  // /************************************************************************/
  // HTMLCanvasElement.prototype.toDataURL = intercept(HTMLCanvasElement.prototype.toDataURL, function (context) {
  //   var canvasWidth = this.width;
  //   var canvasHeight = this.height;
  //
  //   if (canvasWidth < 1 || canvasHeight < 1) {
  //     return context.original.call(this, context.arguments);
  //   }
  //   var pixels = context.device.pixels;
  //
  //   function calculatePlacement(size, placement) {
  //     if (placement < 0.0) {
  //       placement = 0.0;
  //     } else if (placement > 1.0) {
  //       placement = 1.0;
  //     }
  //     var coord = Math.floor((size - 1) * placement);
  //     if (coord < 0) {
  //       coord = 0;
  //     }
  //     if (coord >= size) {
  //       coord = size - 1;
  //     }
  //     return coord;
  //   }
  //
  //   var ctx = null;
  //   try {
  //     ctx = this.getContext("2d")
  //   }
  //   catch (e) {
  //   }
  //
  //   if (ctx && ctx != null) {
  //     var writePixel = function (canvasData, _x, _y, _r, _g, _b, _a) {
  //       var index = (_x + _y * canvasWidth) * 4;
  //       canvasData.data[index] = _r;
  //       canvasData.data[index + 1] = _g;
  //       canvasData.data[index + 2] = _b;
  //       canvasData.data[index + 3] = _a;
  //     };
  //
  //     // Modify ImageData directly.
  //     var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  //     // Write Pixels.
  //     for (var p = 0; p < pixels.length; p++) {
  //       var pixl = pixels[p];
  //       writePixel(canvasData, calculatePlacement(canvasWidth, pixl.x), calculatePlacement(canvasHeight, pixl.y), pixl.r, pixl.g, pixl.b, pixl.a);
  //     }
  //     // Put image data back.
  //     ctx.putImageData(canvasData, 0, 0);
  //   } else {
  //     try {
  //       ctx = this.getContext("webgl");
  //     } catch (e) {
  //     }
  //
  //     if (!ctx || ctx == null) {
  //       try {
  //         ctx = this.getContext("experimental-webgl");
  //       } catch (e) {
  //       }
  //     }
  //
  //     if (ctx != null) {
  //       var gl = ctx;
  //       {
  //         var error = null;
  //         var vshader = "attribute vec2 a_position; uniform vec2 u_resolution; void main() { vec2 zeroToOne = a_position / u_resolution; vec2 zeroToTwo = zeroToOne * 2.0; vec2 clipSpace = zeroToTwo - 1.0; gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);}";
  //         var fshader = "precision mediump float; uniform vec4 u_color; void main() { gl_FragColor = u_color; }";
  //
  //         var loadShader = function (gl, shaderSource, shaderType, opt_errorCallback) {
  //           var errFn = opt_errorCallback || error;
  //           // Create the shader object
  //           var shader = gl.createShader(shaderType);
  //
  //           // Load the shader source
  //           gl.shaderSource(shader, shaderSource);
  //
  //           // Compile the shader
  //           gl.compileShader(shader);
  //
  //           // Check the compile status
  //           var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  //           if (!compiled) {
  //             // Something went wrong during compilation; get the error
  //             //lastError = gl.getShaderInfoLog(shader);
  //             //errFn("*** Error compiling shader '" + shader + "':" + lastError);
  //             gl.deleteShader(shader);
  //             return null;
  //           }
  //
  //           return shader;
  //         };
  //
  //         var loadProgram = function (gl, shaders, opt_attribs, opt_locations) {
  //           var program = gl.createProgram();
  //           for (var ii = 0; ii < shaders.length; ++ii) {
  //             gl.attachShader(program, shaders[ii]);
  //           }
  //           if (opt_attribs) {
  //             for (var ii = 0; ii < opt_attribs.length; ++ii) {
  //               gl.bindAttribLocation(
  //                   program,
  //                   opt_locations ? opt_locations[ii] : ii,
  //                   opt_attribs[ii]);
  //             }
  //           }
  //           gl.linkProgram(program);
  //
  //           // Check the link status
  //           var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  //           if (!linked) {
  //             // something went wrong with the link
  //             error("Error in program linking:" + lastError);
  //
  //             gl.deleteProgram(program);
  //             return null;
  //           }
  //           return program;
  //         };
  //
  //         // Fill the buffer with the values that define a rectangle.
  //         var setRectangle = function (gl, x, y, width, height) {
  //           var x1 = x;
  //           var x2 = x + width;
  //           var y1 = y;
  //           var y2 = y + height;
  //           gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  //             x1, y1,
  //             x2, y1,
  //             x1, y2,
  //             x1, y2,
  //             x2, y1,
  //             x2, y2]), gl.STATIC_DRAW);
  //         };
  //
  //         // setup GLSL program
  //         var vertexShader = loadShader(gl, vshader, gl.VERTEX_SHADER);
  //         var fragmentShader = loadShader(gl, fshader, gl.FRAGMENT_SHADER);
  //         var program = loadProgram(gl, [vertexShader, fragmentShader]);
  //         gl.useProgram(program);
  //
  //         // look up where the vertex data needs to go.
  //         var positionLocation = gl.getAttribLocation(program, "a_position");
  //
  //         // lookup uniforms
  //         var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  //         var colorLocation = gl.getUniformLocation(program, "u_color");
  //
  //         // set the resolution
  //         gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  //
  //         // Create a buffer.
  //         var buffer = gl.createBuffer();
  //         gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //         gl.enableVertexAttribArray(positionLocation);
  //         gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  //
  //         for (var pi = 0; pi < pixels.length; pi++) {
  //           // Get Pixel.
  //           var pixel = pixels[pi];
  //           // Set rectangle.
  //           setRectangle(gl, calculatePlacement(canvasWidth, pixel.x), calculatePlacement(canvasHeight, pixel.y), 1, 1);
  //           // Set color.
  //           gl.uniform4f(colorLocation, pixel.r / 255.0, pixel.g / 255.0, pixel.b / 255.0, pixel.a);
  //
  //           // Draw the rectangle.
  //           gl.drawArrays(gl.TRIANGLES, 0, 6);
  //         }
  //       }
  //     }
  //   }
  //
  //   return context.original.call(this, context.arguments);
  // });


  // Firefox does not inject content scripts into empty frames.
  // This is a major leak.
  // Let's beat them to the punch by using a MutationObserver
  // and patch up any iframes that are leaky.
  if (isFirefox || isChrome || isOpera) {
    /**
     * Patches iframe's window.
     *
     * @param {HTMLIFrameElement} iframe
     */
    function patchIFrame(iframe: HTMLIFrameElement) {

      try {
        // console.log(iframe);

        // let sandbox = iframe.getAttribute('sandbox');
        //
        // if (sandbox && sandbox == 'allow-same-origin') {
        //   console.log(iframe);
        // }

        let contentWindow = iframe.contentWindow;

        let functionStaticDef = contentWindow['Function'];
        let functionDef = functionStaticDef['prototype'];
        let objectStaticDef = contentWindow['Object'];
        let objectDef = objectStaticDef['prototype'];
        let screenStaticDef = contentWindow['Screen'];
        let screenDef = screenStaticDef['prototype'];
        let navigatorStaticDef = contentWindow['Navigator'];
        let navigatorDef = navigatorStaticDef['prototype'];

        // console.log(toNameArray(originalGetOwnPropertyDescriptors(navProto)));

        // Patch function.
        patchFunction(new ProtoDef(functionStaticDef), new ProtoDef(functionDef));
        // Patch Object.
        patchObject(new ProtoDef(objectStaticDef), new ProtoDef(objectDef));
        // Patch screen.
        patchScreen(new ProtoDef(screenDef));
        // Patch navigator.
        patchNavigator(new ProtoDef(navigatorDef));
        // TODO: Patch WebGL.
        // TODO: Patch Canvas.
        // TODO: Patch System Colors.

        // console.log(toNameArray(Object['getOwnPropertyDescriptors'](navProto)));

      } catch (e) {
        // Likely a security error which is ok since the content script will get
        // loaded on every frame.
      }
    }

      /**
       * 
       * @param {Array<HTMLIFrameElement>} list
       * @param {Node} node
       */
    function findIFrames(list: Array<HTMLIFrameElement>, node: Node) {
      if (node.nodeName === 'IFRAME') {
        let iframe = node as HTMLIFrameElement;
        patchIFrame(iframe);
        list.push(iframe);
      } else {
        if (node instanceof HTMLElement) {
          let element = node as HTMLElement;
          if (element.children && element.children.length > 0) {
            for (let i = 0; i < element.children.length; i++) {
              findIFrames(list, element.children[i]);
            }
          }
        } else {
          if (node.childNodes && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
              findIFrames(list, node.childNodes.item(i));
            }
          }
        }
      }
    }

    let iframeList = Array<HTMLIFrameElement>();

    function iframeObserver(element: HTMLElement) {
      var bodyObserver = new MutationObserver(mutations => {
        // console.log(mutations);
        // let mutations = mutations as Array<MutationRecord>;
        // console.log(array);


        for (let i = 0; i < mutations.length; i++) {
          let record = mutations[i];

          // console.log(record.addedNodes);

          // console.log(record);

          for (let a = 0; a < record.addedNodes.length; a++) {
            let node = record.addedNodes.item(a);

            findIFrames(iframeList, node);
          }
        }
      });

      bodyObserver.observe(element, {attributes: true, childList: true, characterData: true});
    }

    let documentObserver = new MutationObserver(mutations => {

      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            let node = mutation.addedNodes[i];

            findIFrames(iframeList, node);

            // // Observe on body.
            // if (node.nodeName === 'BODY') {
            //   // iframeObserver(node as HTMLElement);
            // }
          }
        }
      });
    });

    // Start observing.
    documentObserver.observe(
        document.documentElement,
        {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        }
    );
  }
}})(
    {
    "id": "${secretID}",
    "proxy": function(px) {
      var n = function() {
      // ${secretID}
      return px.apply(this, arguments);
      };

      px.init(n);
      return n;
    }
  }
);`;

try {
  // Handle iframes.
  if (window.self !== window.top) {
    let iframe = window.frameElement;

    if (!iframe) {
      let script = document.createElement('script');
      script.textContent = actualCode;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } else {
      let par = iframe.parentNode;
      if (!par) {
        let script = document.createElement('script');
        script.textContent = actualCode;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
      } else {
        // var script = document.createElement('script');
        // script.textContent = actualCode;
        // (document.head || document.documentElement).appendChild(script);
        // script.remove();

        let sandbox = iframe.getAttribute("sandbox");
        if (sandbox && sandbox.indexOf("allow-scripts") == -1) {
          // Stop iframe from loading.
          window.stop();

          // Save the nextSibling node so the iframe may be inserted back to where it originally was.
          let nextSibling = iframe.nextSibling;

          // Remove from DOM.
          par.removeChild(iframe);

          // Add "allow-scripts" to sandbox.
          // It's important to inherit the original value so we add it onto the end.
          iframe.setAttribute("sandbox", sandbox === '' ? "allow-scripts" : sandbox + " allow-scripts");

          // Add back to DOM.
          if (nextSibling)
            par.insertBefore(iframe, nextSibling);
          else
            par.appendChild(iframe);

          // Revert sandbox back to original value.
          // Since it has already been added back onto the DOM, this won't change
          // the functionality. It makes it look as though nothing has changed.
          iframe.setAttribute("sandbox", sandbox);

          // document.documentElement.setAttribute('onreset', actualCode);
          // document.documentElement.dispatchEvent(new CustomEvent('reset'));
          // document.documentElement.removeAttribute('onreset');

          // let script = document.createElement('script');
          // script.textContent = actualCode;
          // (document.head || document.documentElement).appendChild(script);
          // script.remove();
        } else {
          let script = document.createElement('script');
          script.textContent = actualCode;
          (document.head || document.documentElement).appendChild(script);
          script.remove();
        }
      }
    }
  } else {
    // document.documentElement.setAttribute('onreset', actualCode);
    // document.documentElement.dispatchEvent(new CustomEvent('reset'));
    // document.documentElement.removeAttribute('onreset');

    let script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }
} catch (e) {
  console.log(e);
}

// try {
//   console.log(browser.runtime.id);
// } catch (e) {
//   console.log(chrome.runtime.id);
// }
//
// let device = window.localStorage.getItem('__d');
// // window.localStorage.removeItem('__d');
//
// if (device) {
//   console.log('has DEVICE!!!');
//
//   // window.localStorage.removeItem('__d');
//
//
//   // Inject.
//   let ev = window['eval'];
//
//   try {
//     // Handle iframes.
//     if (window.self !== window.top) {
//       let iframe = window.frameElement;
//
//       if (!iframe) {
//         window.localStorage.removeItem('__d');
//
//         let script = document.createElement('script');
//         script.textContent = actualCode;
//         (document.head || document.documentElement).appendChild(script);
//         script.remove();
//       } else {
//         let par = iframe.parentNode;
//         if (!par) {
//           window.localStorage.removeItem('__d');
//
//           let script = document.createElement('script');
//           script.textContent = actualCode;
//           (document.head || document.documentElement).appendChild(script);
//           script.remove();
//         } else {
//           // var script = document.createElement('script');
//           // script.textContent = actualCode;
//           // (document.head || document.documentElement).appendChild(script);
//           // script.remove();
//
//           let sandbox = iframe.getAttribute("sandbox");
//           if (sandbox && sandbox.indexOf("allow-scripts") == -1) {
//             // Stop iframe from loading.
//             window.stop();
//
//             // Save the nextSibling node so the iframe may be inserted back to where it originally was.
//             let nextSibling = iframe.nextSibling;
//
//             // Remove from DOM.
//             par.removeChild(iframe);
//
//             // Add "allow-scripts" to sandbox.
//             // It's important to inherit the original value so we add it onto the end.
//             iframe.setAttribute("sandbox", sandbox === '' ? "allow-scripts" : sandbox + " allow-scripts");
//
//             // Add back to DOM.
//             if (nextSibling)
//               par.insertBefore(iframe, nextSibling);
//             else
//               par.appendChild(iframe);
//
//             // Revert sandbox back to original value.
//             // Since it has already been added back onto the DOM, this won't change
//             // the functionality. It makes it look as though nothing has changed.
//             iframe.setAttribute("sandbox", sandbox);
//
//             // document.documentElement.setAttribute('onreset', actualCode);
//             // document.documentElement.dispatchEvent(new CustomEvent('reset'));
//             // document.documentElement.removeAttribute('onreset');
//
//             // let script = document.createElement('script');
//             // script.textContent = actualCode;
//             // (document.head || document.documentElement).appendChild(script);
//             // script.remove();
//           } else {
//             let script = document.createElement('script');
//             script.textContent = actualCode;
//             (document.head || document.documentElement).appendChild(script);
//             script.remove();
//           }
//         }
//       }
//     } else {
//       window.localStorage.removeItem('__d');
//
//       // document.documentElement.setAttribute('onreset', actualCode);
//       // document.documentElement.dispatchEvent(new CustomEvent('reset'));
//       // document.documentElement.removeAttribute('onreset');
//
//       let script = document.createElement('script');
//       script.textContent = actualCode;
//       (document.head || document.documentElement).appendChild(script);
//       script.remove();
//     }
//   } catch (e) {
//     console.log(e);
//   }
// } else {
//   window.stop();
//
//   try {
//     browser.storage.local.get('device').then(device => {
//       console.log('Device data retrieved from Local Storage', device);
//       window['__device'] = device;
//
//       window.localStorage['_d'] = 'Hi';
//
//       window.localStorage.setItem('__d', JSON.stringify(device));
//       window.location.reload();
//       // window.location.reload();
//       // console.log(window);
//     });
//   } catch (e) {
//     chrome.storage.local.get('device', device => {
//       console.log('Device data retrieved from Local Storage', device);
//       window['__device'] = device;
//
//       window.localStorage.setItem('__d', JSON.stringify(device));
//       // window.location.reload();
//       // window.location.reload();
//       // console.log(window);
//     });
//   }
//
//   // if (browser) {
//   //   browser.storage.local.get('device').then(device => {
//   //     console.log('Device data retrieved from Local Storage', device);
//   //     window['__device'] = device;
//   //
//   //     window.localStorage.setItem('__d', JSON.stringify(device));
//   //     window.location.reload();
//   //     // window.location.reload();
//   //     // console.log(window);
//   //   });
//   // } else if (chrome) {
//   //   chrome.storage.local.get('device', device => {
//   //     console.log('Device data retrieved from Local Storage', device);
//   //     window['__device'] = device;
//   //
//   //     window.localStorage.setItem('__d', JSON.stringify(device));
//   //     window.location.reload();
//   //     // window.location.reload();
//   //     // console.log(window);
//   //   });
//   // }
// }
//
