/**************************************************************************************/
// Fingerprint Browser Patch
// ------------------------------------------------------------------------------------
// Modifies properties used to create a javascript Browser Fingerprint. The goal
// is to appear like a normal unsuspecting user with no direct counter-measures
// implemented. Just another "unique" user begging to be tracked :).
//
//
// Tamper Proofing
// ------------------------------------------------------------------------------------
// "toString()" can leak the fact that javascript properties were changed.
// Intelligent "anti-fraud" / "spyware" can use that information to block, censor
// and track the user. This script utilizes techniques to render those attacks
// useless.
//
//
// Same Platform Strategy
// ------------------------------------------------------------------------------------
// ALWAYS use the same platform that the patch is spoofing. For example run the
// patch on Chrome for Chrome profiles, Firefox for Firefox and so on. The reason
// is that it isn't feasible or possible to spoof discordant platforms in their
// entirety without patching the core engine which is not a good move :). For example
// Firefox has lots of properties that begin with "moz". Those properties are in CSS
// and various system javascript object prototypes, some of which are sealed.
//
//
// Latest Version Strategy
// ------------------------------------------------------------------------------------
// Features are being added to modern browsers at a very fast pace. Furthermore,
// these browsers also employ very aggressive auto-updaters. Supporting older versions
// and all the minute differences between them is a waste of time. Instead, these
// patches are applied to the latest versions which make them appear to have upgraded.
//
//
// WebGL, Canvas, getClientRect(s)
// ------------------------------------------------------------------------------------
// A random static modifier(s) that are generated when the fingerprint profile
// was created. DOMRect's are adjusted accordingly. "toDataURL()" is hijacked
// and the image is statically modified based on modifiers. This results in a
// unique yet consistent result.
/**************************************************************************************/

const KEY = 'P'
const MAGIC = 'AAAAAAAAAAAAAAAAAAAAAAAA'
const UID = ''//generateUUID()

// Create background request
const REQUEST = {
  type: KEY,
  id: UID,
  replace: sessionStorage.getItem(KEY),
}

// Connect to background page.
let PORT = browser.runtime.connect('', { name: KEY })

PORT.postMessage(REQUEST)

// Listen for messages
PORT.onMessage.addListener((message: any) => {
  // Save in local storage temporarily.
  sessionStorage.setItem(KEY, JSON.stringify(message))

  // location.hash = "b=" + JSON.stringify(message)

  // Reload frame.
  // window.location.reload()
})

let profile = JSON.stringify({
  navigator: {
    appCodeName: 'UT',
    appVersion: '1.0',
    userAgent: 'Modilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.2228.0 Safari/537.36',

    connection: {
      downlink: 22.2,
      effectiveType: 'uber-10g',
      rtt: 5000,
      saveData: false,
    },

    mediaDevices: [
      {
        deviceId: 'default',
        kind: 'audioinput',
        label: '',
        groupId: '06a0a735d20f05dff62753e893335965186a63b701078e6ee961ce3fccaf7a8c',
      },
      {
        deviceId: 'bc14817bcb046ce9c9e63ecdf68209925dd84657817c18b0579f77e727698048',
        kind: 'audioinput',
        label: '',
        groupId: '06a0a735d20f05dff62753e893335965186a63b701078e6ee961ce3fccaf7a8c',
      },
      {
        deviceId: 'b0e704b8787ba12df1d4d21dde69202affd05037f5f890cb3d3cde77722cca53',
        kind: 'videoinput',
        label: '',
        groupId: '',
      },
      {
        deviceId: 'default',
        kind: 'audiooutput',
        label: '',
        groupId: '06a0a735d20f05dff62753e893335965186a63b701078e6ee961ce3fccaf7a8c',
      },
    ],
  },
  screen: {
    width: 802,
    height: 803,
    availWidth: 801,
    availHeight: 802,
    orientation: {
      angle: 1,
      type: 'special'
    },
  },
})

// Synchronous sessionStorage getItem.
// let profile = localStorage.getItem(KEY)
if (!profile) {
  // Abort page load.
  window.stop()
  // Ask background for profile.
  PORT.postMessage(REQUEST)
} else {
  // Remove from local storage.
  sessionStorage.removeItem(KEY)

  let actualCode = `(${
    function (DEVICE: any) {
      let start = window.performance.now()
      console.log('Untraceable :(): Fingerprint Patch Begin')

      let isFirefox = window.hasOwnProperty('mozInnerScreenX')
      let isChrome = window.hasOwnProperty('chrome')
      let isOpera = window.hasOwnProperty('opera')
      // let isEdge = false
      // let isSafari = false

      // Proto map.
      let PROTO_MAP = new WeakMap<any, any>()

      let GET_OWN_PROPERTY_DESCRIPTORS = Object[ 'getOwnPropertyDescriptors' ]
      let GET_OWN_PROPERTY_DESCRIPTOR = Object.getOwnPropertyDescriptor
      let GET_OWN_PROPERTY_NAMES = Object.getOwnPropertyNames
      let TO_SOURCE = Object.prototype[ 'toSource' ]

      let MISSING_PROPS = []

      interface Interceptor {
        toString(): string
      }

      let INTERCEPTOR_MAP = new WeakMap<any, any>()

      /**
       *
       */
      class Prototype {
        public base: any
        public names: string[]
        public descriptors: any

        constructor (public proto: any) {
          this.names = GET_OWN_PROPERTY_NAMES(proto)
          this.descriptors = GET_OWN_PROPERTY_DESCRIPTORS(proto)
          this.base = Object.create(proto)

          PROTO_MAP.set(proto, this)
        }

        hasOwnProperty (name: string): boolean {
          return this.proto.hasOwnProperty(name)
        }

        getOwnPropertyNames (): string[] {
          return GET_OWN_PROPERTY_NAMES(this.proto)
        }

        getOwnPropertyDescriptor (name: string) {
          return GET_OWN_PROPERTY_DESCRIPTOR(this.proto, name)
        }

        propertyIsEnumerable (name: string) {
          return this.proto.propertyIsEnumerable(name)
        }

        getOwnPropertyDescriptors () {
          let names = this.getOwnPropertyNames()
          let descriptors = {}

          for (let i = 0; i < names.length; i++) {
            let name = names[ i ]

            descriptors[ name ] = GET_OWN_PROPERTY_DESCRIPTOR(this.proto, name)
          }

          return descriptors
        }

        /**
         *
         * @param {(name: string, base: (thisArg: any, argArray?: any) => any) => any} provider
         */
        define (provider: (name: string, base: (thisArg: any, argArray?: any) => any) => any) {
          // Iterate through original descriptors.
          for (let name in this.descriptors) {
            let descriptor = this.descriptors[ name ]
            let shim = provider(name, (thisArg: any, argArray?: any): any => {
              if (descriptor.get) {
                return descriptor.get.apply(thisArg, argArray)
              } else if (descriptor.value && descriptor.value instanceof Function) {
                return descriptor.value.apply(thisArg, argArray)
              } else {
                return descriptor.value
              }
            })

            if (shim) {
              new PropertyInterceptor(name, this, descriptor, shim)
            } else {
              try {
                Object.defineProperty(this.proto, name, descriptor)
              } catch (e) {
                // Ignore
              }
            }
          }
        }
      }

      /**
       * Property interceptor.
       */
      class PropertyInterceptor {
        public superValue: any
        public descriptor: PropertyDescriptor

        constructor (public name: string,
                     public proto: Prototype,
                     public superDescriptor: PropertyDescriptor,
                     shim: any) {
          let shimProps = GET_OWN_PROPERTY_NAMES(shim)
          let getter = shimProps && shimProps.length > 0 ? GET_OWN_PROPERTY_DESCRIPTOR(shim, shimProps[ 0 ]) : null

          // const self = this
          let descriptor = {}
          let descriptors = GET_OWN_PROPERTY_DESCRIPTORS(this.superDescriptor)
          for (let name in descriptors) {
            let d = descriptors[ name ]

            switch (name) {
              case 'get':
                this.superValue = d.value

                if (!getter) {
                  if (shim instanceof Function) {
                    descriptor[ 'get' ] = function () {
                      return shim.apply(this, arguments)
                    }
                  } else {
                    descriptor[ 'get' ] = function () {
                      return shim
                    }
                  }
                } else {
                  if (getter.get) {
                    if (d.value.name == '') {
                      descriptor[ 'get' ] = function () {
                        return getter.get.apply(this, arguments)
                      }
                    } else {
                      descriptor[ 'get' ] = getter.get
                    }
                  } else {
                    if (d.value.name == '') {
                      descriptor[ 'get' ] = function () {
                        return getter.value.apply(this, arguments)
                      }
                    } else {
                      descriptor[ 'get' ] = getter.value
                    }
                  }
                }

                // Register with global interceptor
                INTERCEPTOR_MAP.set(descriptor[ 'get' ], this)
                break

              case 'set':
                break

              case 'value':
                this.superValue = d.value

                if (!getter) {
                  descriptor[ 'value' ] = shim
                } else {
                  descriptor[ 'value' ] = getter.get || getter.value
                }

                INTERCEPTOR_MAP.set(descriptor[ 'value' ], this)
                break

              default:
                Object.defineProperty(descriptor, name, d)
                break
            }
          }

          this.descriptor = descriptor
          Object.defineProperty(this.proto.proto, this.name, this.descriptor)
        }

        toString () {
          // Map toString to the original function.
          return this.superValue.toString()
        }

        toSource () {
          // Map toSource to the original function.
          return this.superValue.toSource()
        }
      }

      function VAL_AT (...path: string[]): any {
        if (!path || path.length == 0) {
          return null
        }

        let model = DEVICE
        for (let i = 0; i < path.length; i++) {
          model = model[ path[ i ] ]

          if (!model) {
            return null
          }
        }
        return model
      }

      function SUB_VAL (or: any, sub: any, ...path: string[]): any {
        if (!path || path.length == 0) {
          return or
        }

        let model = sub
        for (let i = 0; i < path.length; i++) {
          model = model[ path[ i ] ]

          if (!model) {
            return or
          }
        }
        return model
      }

      function VAL (or: any, ...path: string[]): any {
        return SUB_VAL(or, DEVICE, ...path)
      }

      // let systemColors = {}
      //
      // class GetComputedStyles extends AbstractFunctionProxy {
      //   constructor(public proto: any, propertyName: string, public original: any) {
      //     super(proto, propertyName, original)
      //   }
      //
      //   apply(thisArg: any, argArray?: any): any {
      //     console.log('HasOwnProperty')
      //
      //     let elem = argArray[0]
      //     let pseudoElt = argArray[1]
      //
      //     if (!elem) {
      //       return null
      //     }
      //
      //     let systemColors = ["ActiveBorder", "ActiveCaption", "AppWorkspace", "Background", "ButtonFace", "ButtonHighlight", "ButtonShadow", "ButtonText", "CaptionText", "GrayText", "Highlight", "HighlightText", "InactiveBorder", "InactiveCaption", "InactiveCaptionText", "InfoBackground", "InfoText", "Menu", "MenuText", "Scrollbar", "ThreeDDarkShadow", "ThreeDFace", "ThreeDHighlight", "ThreeDLightShadow", "ThreeDShadow", "Window", "WindowFrame", "WindowText"]
      //     let cssProps = ["color", "background", "backgroundColor", "border", "borderColor", "borderTop", "borderLeft", "borderRight", "borderBottom", "borderTopColor", "borderLeftColor", "borderRightColor", "borderBottomColor"]
      //     let propsWithSystemColor = {}
      //
      //     let whitespaceRegExp = /\s+/g
      //
      //     for (let j = 0 j < cssProps.length j++) {
      //       let cssProp = cssProps[j]
      //       let value = elem.style.getPropertyValue(cssProp)
      //       if (!value) continue
      //
      //       let valueStr = value.toString().toLowerCase()
      //       let parts = valueStr.split(whitespaceRegExp)
      //
      //       for (let i = 0 i < systemColors.length i++) {
      //         let systemColor = systemColors[i]
      //         let systemColorLower = systemColor.toLowerCase()
      //
      //         for (let m = 0 m < parts.length m++) {
      //           if (parts[m] == systemColorLower) {
      //             propsWithSystemColor[cssProp] = systemColors[systemColor]
      //             break
      //           }
      //         }
      //       }
      //     }
      //
      //     let computedStyle = this.original.apply(this, elem, pseudoElt)
      //
      //     if (computedStyle.getPropertyCSSValue) {
      //       computedStyle.getPropertyCSSValue = intercept(computedStyle.getPropertyCSSValue, function (ctx) {
      //         let propertyName = ctx.arguments.length > 0 ? ctx.arguments[0] : ""
      //         return ctx.original.call(this, propertyName)
      //       })
      //     }
      //
      //     computedStyle.getPropertyValue = intercept(computedStyle.getPropertyValue, function (ctx) {
      //       let propertyName = ctx.arguments.length > 0 ? ctx.arguments[0] : ""
      //       if (propsWithSystemColor) {
      //         let rgbPattern = /[rR][gG][bB][aA]?[\s]*[(]([\s]*[\d]+[\s]*[,]){1,3}[\s]*[\d]+[\s]*[)]/g
      //
      //         for (let y in propsWithSystemColor) {
      //           if (y != propertyName) {
      //             continue
      //           }
      //           let computedStyleProp = ctx.original.call(this, propertyName)
      //           let rgbValue = propsWithSystemColor[y]
      //           return computedStyleProp.replace(rgbPattern, rgbValue)
      //         }
      //       }
      //       return ctx.original.call(this, propertyName)
      //     })
      //
      //     return originalValue
      //   }
      // }

      /*****************************************************************************/
      // Function overrides
      /*****************************************************************************/

      /**
       * Function.prototype is leak central! Every single patch is a user defined
       * function which leaks it's own source code. This exposes the user to the
       * fact that's it's been tampered with.
       *
       * @param {Prototype} staticFunctionDef
       * @param {Prototype} functionDef
       */
      function patchFunction (staticFunctionDef: Prototype, functionDef: Prototype) {
        for (let i = 0; i < functionDef.names.length; i++) {
          let propertyName = functionDef.names[ i ]
          let descriptor = functionDef.descriptors[ propertyName ]

          switch (propertyName) {
            case 'toString':
              let toStringDescriptor = descriptor
              let FUNCTION_TO_STRING = function toString (): any {
                let interceptor = INTERCEPTOR_MAP.get(this)
                if (interceptor) {
                  return interceptor.toString()
                }

                return toStringDescriptor.value.apply(this)
              }

              INTERCEPTOR_MAP.set(FUNCTION_TO_STRING, descriptor.value.toString())

              Object.defineProperty(
                functionDef.proto,
                propertyName,
                {
                  value: FUNCTION_TO_STRING,
                  writable: toStringDescriptor.writable,
                  enumerable: toStringDescriptor.enumerable,
                  configurable: toStringDescriptor.configurable
                }
              )
              break

            case 'toSource':
              // Only Firefox supports this method.
              if (TO_SOURCE) {
                let toSourceDescriptor = descriptor
                let FUNCTION_TO_SOURCE = function toSource (): any {
                  let interceptor = INTERCEPTOR_MAP.get(this)
                  if (interceptor) {
                    return interceptor.toSource()
                  }

                  return toSourceDescriptor.value.apply(this)
                }

                INTERCEPTOR_MAP.set(FUNCTION_TO_SOURCE, descriptor.value.toString())

                Object.defineProperty(
                  functionDef.proto,
                  propertyName,
                  {
                    value: FUNCTION_TO_SOURCE,
                    writable: toSourceDescriptor.writable,
                    enumerable: toSourceDescriptor.enumerable,
                    configurable: toSourceDescriptor.configurable
                  }
                )
              }
              break

            default:
              try {
                Object.defineProperty(
                  functionDef.proto,
                  propertyName,
                  descriptor
                )
              } catch (e) {
                // Ignore
              }
              break
          }
        }
      }

      /*****************************************************************************/
      // Screen
      /*****************************************************************************/

      /**
       *
       * @param {Prototype} proto
       */
      function patchScreen (proto: Prototype) {
        proto.define((name, base) => {
          switch (name) {
            case 'availHeight':
              return {
                get availHeight () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'availHeight'
                  )
                }
              }

            case 'availLeft':
              return {
                get availLeft () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'availLeft'
                  )
                }
              }

            case 'availTop':
              return {
                get availTop () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'availTop'
                  )
                }
              }

            case 'availWidth':
              return {
                get availWidth () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'availWidth'
                  )
                }
              }

            case 'colorDepth':
              return {
                get colorDepth () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'colorDepth'
                  )
                }
              }

            case 'left':
              return {
                get left () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'left'
                  )
                }
              }

            case 'width':
              return {
                get width () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'width'
                  )
                }
              }

            case 'height':
              return {
                get height () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'height'
                  )
                }
              }

            case 'mozOrientation':
              return {
                get mozOrientation () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'mozOrientation'
                  )
                }
              }

            case 'orientation':
              return patchOrientation()

            case 'pixelDepth':
              return {
                get pixelDepth () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'pixelDepth'
                  )
                }
              }

            case 'top':
              return {
                get top () {
                  return VAL(
                    base(this, arguments),
                    'screen', 'top'
                  )
                }
              }
          }
          return null
        })
      }

      function patchOrientation (): any {
        let model = VAL_AT('screen', 'orientation')
        if (!model) {
          return null
        }

        let so = window[ 'ScreenOrientation' ]
        if (!so) {
          return null
        }

        let proto = new Prototype(so.prototype)
        proto.define((name, base) => {
          switch (name) {
            case 'angle':
              return {
                get angle () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'angle'
                  )
                }
              }

            case 'type':
              return {
                get type () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'type'
                  )
                }
              }
          }
          return null
        })

        return null
      }

      /*****************************************************************************/
      // Navigator
      /*****************************************************************************/

      /**
       *
       * @param {Prototype} proto
       */
      function patchNavigator (proto: Prototype) {
        proto.define((name, base) => {
          switch (name) {
            case 'appCodeName':
              return {
                get appCodeName () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'appCodeName'
                  )
                }
              }

            case 'appName':
              return {
                get appName () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'appName'
                  )
                }
              }

            case 'appVersion':
              return {
                get appVersion () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'appVersion'
                  )
                }
              }

            case 'bluetooth':
              return null

            case 'budget':
              return null

            case 'connection':
              return patchConnection()

            case 'cookieEnabled':
              return null

            case 'credentials':
              return null

            case 'deviceMemory':
              return {
                get deviceMemory () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'deviceMemory'
                  )
                }
              }

            case 'doNotTrack':
              return {
                get doNotTrack () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'doNotTrack'
                  )
                }
              }

            case 'geolocation':
              return null

            case 'hardwareConcurrency':
              return {
                get hardwareConcurrency () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'hardwareConcurrency'
                  )
                }
              }

            case 'language':
              return {
                get language () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'language'
                  )
                }
              }

            case 'languages':
              return {
                get languages () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'languages'
                  )
                }
              }

            case 'maxTouchPoints':
              return {
                get maxTouchPoints () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'maxTouchPoints'
                  )
                }
              }

            case 'mediaDevices':
              return null

            case 'mimeTypes':
              return null

            case 'onLine':
              return {
                get maxTouchPoints () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'onLine'
                  )
                }
              }

            case 'permissions':
              return null

            case 'platform':
              return {
                get platform () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'platform'
                  )
                }
              }

            case 'plugins':
              return null

            case 'presentation':
              return null

            case 'product':
              return {
                get product () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'product'
                  )
                }
              }

            case 'productSub':
              return {
                get productSub () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'productSub'
                  )
                }
              }

            case 'serviceWorker':
              return null

            case 'storage':
              return null

            case 'usb':
              return null

            case 'userAgent':
              return {
                get userAgent () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'userAgent'
                  )
                }
              }

            case 'vendor':
              return {
                get vendor () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'vendor'
                  )
                }
              }

            case 'vendorSub':
              return {
                get vendor () {
                  return VAL(
                    base(this, arguments),
                    'navigator', 'vendorSub'
                  )
                }
              }

            case 'webkitPersistentStorage':
              return null

            case 'webkitTemporaryStorage':
              return null

            default:
              return null
          }
        })
      }

      function patchConnection () {
        let model = VAL_AT('navigator', 'connection')
        if (!model) {
          return null
        }
        
        let networkInformation = window[ 'NetworkInformation' ]
        if (!networkInformation) {
          return null
        }

        let proto = new Prototype(networkInformation.prototype)
        proto.define((name, base) => {
          switch (name) {
            case 'downlink':
              return {
                get downlink () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'downlink'
                  )
                }
              }

            case 'effectiveType':
              return {
                get effectiveType () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'effectiveType'
                  )
                }
              }

            case 'rtt':
              return {
                get rtt () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'rtt'
                  )
                }
              }

            case 'saveData':
              return {
                get saveData () {
                  return SUB_VAL(
                    base(this, arguments),
                    model,
                    'saveData'
                  )
                }
              }
          }
          return null
        })

        return null
      }
      
      function patchMediaDevices() {
        
      }

      function patchPlugins () {

      }
      
      function patchMimeTypes() {
        
      }

      /**
       *
       * @param {Prototype} protoDef
       */
      // function patchWebGL (protoDef: ProtoDef) {
      //
      // }
      //
      // function patchCanvas (protoDef: ProtoDef) {
      // }
      //
      // function patchSystemColors (protoDef: ProtoDef) {
      //
      // }
      //
      // function patchWebRTC () {
      //
      // }

      /*****************************************************************************/
      // Apply Patches
      /*****************************************************************************/

      function patch (win: any) {
        // ignore
        let functionStaticDef = win[ 'Function' ]
        let functionDef = functionStaticDef[ 'prototype' ]
        let objectStaticDef = win[ 'Object' ]
        let objectDef = objectStaticDef[ 'prototype' ]
        let screenStaticDef = win[ 'Screen' ]
        let screenDef = screenStaticDef[ 'prototype' ]
        let navigatorStaticDef = win[ 'Navigator' ]
        let navigatorDef = navigatorStaticDef[ 'prototype' ]

        // Patch function.
        patchFunction(new Prototype(functionStaticDef), new Prototype(functionDef))
        // // Patch Object.
        // patchObject(new ProtoDef(objectStaticDef), new ProtoDef(objectDef))
        // // Patch screen.
        patchScreen(new Prototype(screenDef))
        // // Patch navigator.
        patchNavigator(new Prototype(navigatorDef))
        // TODO: Patch WebGL.
        // TODO: Patch Canvas.
        // TODO: Patch System Colors.
      }

      patch(window)

      // /************************************************************************/
      // /************************************************************************/
      // // WebGL getSupportedExtensions
      // /************************************************************************/
      // /************************************************************************/
      // let webGLExtensions = []
      // if (DEVICE.webGLExtensions) {
      //   for (let i = 0 i < DEVICE.webGLExtensions.length i++) {
      //     webGLExtensions.push(DEVICE.webGLExtensions[i].name)
      //   }
      // }
      // WebGLRenderingContext.prototype.getSupportedExtensions = intercept(WebGLRenderingContext.prototype.getSupportedExtensions, function (context) {
      //   return webGLExtensions
      // })
      //
      //
      // /************************************************************************/
      // /************************************************************************/
      // // WebGL getParameter
      // /************************************************************************/
      // /************************************************************************/
      // WebGLRenderingContext.prototype.getParameter = intercept(WebGLRenderingContext.prototype.getParameter, function (context) {
      //   let id = context.arguments[0]
      //   let webgl = context.DEVICE.webGL
      //
      //   if (id == this.ALPHA_BITS) {
      //     return webgl.alphaBits
      //   }
      //   if (id == this.BLUE_BITS) {
      //     return webgl.blueBits
      //   }
      //   if (id == this.DEPTH_BITS) {
      //     return webgl.depthBits
      //   }
      //   if (id == this.GREEN_BITS) {
      //     return webgl.greenBits
      //   }
      //   if (id == this.MAX_COMBINED_TEXTURE_IMAGE_UNITS) {
      //     return webgl.maxCombinedTextureImageUnits
      //   }
      //   if (id == this.MAX_CUBE_MAP_TEXTURE_SIZE) {
      //     return webgl.maxCubeMapTextureSize
      //   }
      //   if (id == this.MAX_FRAGMENT_UNIFORM_VECTORS) {
      //     return webgl.maxFragmentUniformVectors
      //   }
      //   if (id == this.MAX_RENDERBUFFER_SIZE) {
      //     return webgl.maxRenderBufferSize
      //   }
      //   if (id == this.MAX_TEXTURE_IMAGE_UNITS) {
      //     return webgl.maxTextureImageUnits
      //   }
      //   if (id == this.MAX_TEXTURE_SIZE) {
      //     return webgl.maxTextureSize
      //   }
      //   if (id == this.MAX_VARYING_VECTORS) {
      //     return webgl.maxVaryingVectors
      //   }
      //   if (id == this.MAX_VERTEX_ATTRIBS) {
      //     return webgl.maxVertexAttribs
      //   }
      //   if (id == this.MAX_VERTEX_TEXTURE_IMAGE_UNITS) {
      //     return webgl.maxVertexTextureImageUnits
      //   }
      //   if (id == this.MAX_VERTEX_UNIFORM_VECTORS) {
      //     return webgl.maxVertexUniformVectors
      //   }
      //   if (id == this.RED_BITS) {
      //     return webgl.redBits
      //   }
      //   if (id == this.RENDERER) {
      //     return webgl.renderer
      //   }
      //   if (id == this.SHADING_LANGUAGE_VERSION) {
      //     return webgl.shadingLanguageVersion
      //   }
      //   if (id == this.STENCIL_BITS) {
      //     return webgl.stencilBits
      //   }
      //   if (id == this.VENDOR) {
      //     return webgl.vendor
      //   }
      //   if (id == this.VERSION) {
      //     return webgl.version
      //   }
      //   if (id == this.MAX_VIEWPORT_DIMS) {
      //     return [webgl.maxViewportWidth, webgl.maxViewportHeight]
      //   }
      //   if (id == this.ALIASED_LINE_WIDTH_RANGE) {
      //     return [webgl.aliasedLineWidthRangeLow, webgl.aliasedLineWidthRangeHigh]
      //   }
      //   if (id == this.ALIASED_POINT_SIZE_RANGE) {
      //     return [webgl.aliasedPointSizeRangeLow, webgl.aliasedPointSizeRangeHigh]
      //   }
      //   let ext = this.getExtension("EXT_texture_filter_anisotropic") || this.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || this.getExtension("MOZ_EXT_texture_filter_anisotropic")
      //   if (ext) {
      //     if (id == ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) {
      //       return webgl.maxAnisotropy
      //     }
      //   }
      //
      //   ext = this.getExtension("WEBGL_debug_renderer_info")
      //   if (ext) {
      //     if (id == ext.UNMASKED_VENDOR_WEBGL) {
      //       return webgl.unmaskedVendor
      //     }
      //     if (id == ext.UNMASKED_RENDERER_WEBGL) {
      //       return webgl.unmaskedRenderer
      //     }
      //   }
      //
      //   return context.original.call(this, id)
      // })
      //
      //
      // /************************************************************************/
      // /************************************************************************/
      // // WebGL getShaderPrecisionFormat
      // /************************************************************************/
      // /************************************************************************/
      // WebGLRenderingContext.prototype.getShaderPrecisionFormat = intercept(WebGLRenderingContext.prototype.getShaderPrecisionFormat, function (context) {
      //   let shaderType = context.arguments[0]
      //   let precisionType = context.arguments[1]
      //   let webgl = context.DEVICE.webGL
      //
      //   if (shaderType == this.VERTEX_SHADER) {
      //     if (precisionType == this.HIGH_FLOAT) {
      //       return webgl.vertexShaderHighFloat
      //     }
      //     if (precisionType == this.MEDIUM_FLOAT) {
      //       return webgl.vertexShaderMediumFloat
      //     }
      //     if (precisionType == this.LOW_FLOAT) {
      //       return webgl.vertexShaderLowFloat
      //     }
      //     if (precisionType == this.HIGH_INT) {
      //       return webgl.vertexShaderHighInt
      //     }
      //     if (precisionType == this.MEDIUM_INT) {
      //       return webgl.vertexShaderMediumInt
      //     }
      //     if (precisionType == this.LOW_INT) {
      //       return webgl.vertexShaderLowInt
      //     }
      //   } else if (shaderType == this.FRAGMENT_SHADER) {
      //     if (precisionType == this.HIGH_FLOAT) {
      //       return webgl.fragmentShaderHighFloat
      //     }
      //     if (precisionType == this.MEDIUM_FLOAT) {
      //       return webgl.fragmentShaderMediumFloat
      //     }
      //     if (precisionType == this.LOW_FLOAT) {
      //       return webgl.fragmentShaderLowFloat
      //     }
      //     if (precisionType == this.HIGH_INT) {
      //       return webgl.fragmentShaderHighInt
      //     }
      //     if (precisionType == this.MEDIUM_INT) {
      //       return webgl.fragmentShaderMediumInt
      //     }
      //     if (precisionType == this.LOW_INT) {
      //       return webgl.fragmentShaderLowInt
      //     }
      //   }
      //   return context.original.call(this, shaderType, precisionType)
      // })
      //
      //
      // /************************************************************************/
      // /************************************************************************/
      // // Canvas toDataURL
      // /************************************************************************/
      // /************************************************************************/
      // HTMLCanvasElement.prototype.toDataURL = intercept(HTMLCanvasElement.prototype.toDataURL, function (context) {
      //   let canvasWidth = this.width
      //   let canvasHeight = this.height
      //
      //   if (canvasWidth < 1 || canvasHeight < 1) {
      //     return context.original.call(this, context.arguments)
      //   }
      //   let pixels = context.DEVICE.pixels
      //
      //   function calculatePlacement(size, placement) {
      //     if (placement < 0.0) {
      //       placement = 0.0
      //     } else if (placement > 1.0) {
      //       placement = 1.0
      //     }
      //     let coord = Math.floor((size - 1) * placement)
      //     if (coord < 0) {
      //       coord = 0
      //     }
      //     if (coord >= size) {
      //       coord = size - 1
      //     }
      //     return coord
      //   }
      //
      //   let ctx = null
      //   try {
      //     ctx = this.getContext("2d")
      //   }
      //   catch (e) {
      //   }
      //
      //   if (ctx && ctx != null) {
      //     let writePixel = function (canvasData, _x, _y, _r, _g, _b, _a) {
      //       let index = (_x + _y * canvasWidth) * 4
      //       canvasData.data[index] = _r
      //       canvasData.data[index + 1] = _g
      //       canvasData.data[index + 2] = _b
      //       canvasData.data[index + 3] = _a
      //     }
      //
      //     // Modify ImageData directly.
      //     let canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
      //     // Write Pixels.
      //     for (let p = 0 p < pixels.length p++) {
      //       let pixl = pixels[p]
      //       writePixel(canvasData, calculatePlacement(canvasWidth, pixl.x), calculatePlacement(canvasHeight, pixl.y), pixl.r, pixl.g, pixl.b, pixl.a)
      //     }
      //     // Put image data back.
      //     ctx.putImageData(canvasData, 0, 0)
      //   } else {
      //     try {
      //       ctx = this.getContext("webgl")
      //     } catch (e) {
      //     }
      //
      //     if (!ctx || ctx == null) {
      //       try {
      //         ctx = this.getContext("experimental-webgl")
      //       } catch (e) {
      //       }
      //     }
      //
      //     if (ctx != null) {
      //       let gl = ctx
      //       {
      //         let error = null
      //         let vshader = "attribute vec2 a_position uniform vec2 u_resolution void main() { vec2 zeroToOne = a_position / u_resolution vec2 zeroToTwo = zeroToOne * 2.0 vec2 clipSpace = zeroToTwo - 1.0 gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1)}"
      //         let fshader = "precision mediump float uniform vec4 u_color void main() { gl_FragColor = u_color }"
      //
      //         let loadShader = function (gl, shaderSource, shaderType, opt_errorCallback) {
      //           let errFn = opt_errorCallback || error
      //           // Create the shader object
      //           let shader = gl.createShader(shaderType)
      //
      //           // Load the shader source
      //           gl.shaderSource(shader, shaderSource)
      //
      //           // Compile the shader
      //           gl.compileShader(shader)
      //
      //           // Check the compile status
      //           let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      //           if (!compiled) {
      //             // Something went wrong during compilation get the error
      //             //lastError = gl.getShaderInfoLog(shader)
      //             //errFn("*** Error compiling shader '" + shader + "':" + lastError)
      //             gl.deleteShader(shader)
      //             return null
      //           }
      //
      //           return shader
      //         }
      //
      //         let loadProgram = function (gl, shaders, opt_attribs, opt_locations) {
      //           let program = gl.createProgram()
      //           for (let ii = 0 ii < shaders.length ++ii) {
      //             gl.attachShader(program, shaders[ii])
      //           }
      //           if (opt_attribs) {
      //             for (let ii = 0 ii < opt_attribs.length ++ii) {
      //               gl.bindAttribLocation(
      //                   program,
      //                   opt_locations ? opt_locations[ii] : ii,
      //                   opt_attribs[ii])
      //             }
      //           }
      //           gl.linkProgram(program)
      //
      //           // Check the link status
      //           let linked = gl.getProgramParameter(program, gl.LINK_STATUS)
      //           if (!linked) {
      //             // something went wrong with the link
      //             error("Error in program linking:" + lastError)
      //
      //             gl.deleteProgram(program)
      //             return null
      //           }
      //           return program
      //         }
      //
      //         // Fill the buffer with the values that define a rectangle.
      //         let setRectangle = function (gl, x, y, width, height) {
      //           let x1 = x
      //           let x2 = x + width
      //           let y1 = y
      //           let y2 = y + height
      //           gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      //             x1, y1,
      //             x2, y1,
      //             x1, y2,
      //             x1, y2,
      //             x2, y1,
      //             x2, y2]), gl.STATIC_DRAW)
      //         }
      //
      //         // setup GLSL program
      //         let vertexShader = loadShader(gl, vshader, gl.VERTEX_SHADER)
      //         let fragmentShader = loadShader(gl, fshader, gl.FRAGMENT_SHADER)
      //         let program = loadProgram(gl, [vertexShader, fragmentShader])
      //         gl.useProgram(program)
      //
      //         // look up where the vertex data needs to go.
      //         let positionLocation = gl.getAttribLocation(program, "a_position")
      //
      //         // lookup uniforms
      //         let resolutionLocation = gl.getUniformLocation(program, "u_resolution")
      //         let colorLocation = gl.getUniformLocation(program, "u_color")
      //
      //         // set the resolution
      //         gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
      //
      //         // Create a buffer.
      //         let buffer = gl.createBuffer()
      //         gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      //         gl.enableVertexAttribArray(positionLocation)
      //         gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      //
      //         for (let pi = 0 pi < pixels.length pi++) {
      //           // Get Pixel.
      //           let pixel = pixels[pi]
      //           // Set rectangle.
      //           setRectangle(gl, calculatePlacement(canvasWidth, pixel.x), calculatePlacement(canvasHeight, pixel.y), 1, 1)
      //           // Set color.
      //           gl.uniform4f(colorLocation, pixel.r / 255.0, pixel.g / 255.0, pixel.b / 255.0, pixel.a)
      //
      //           // Draw the rectangle.
      //           gl.drawArrays(gl.TRIANGLES, 0, 6)
      //         }
      //       }
      //     }
      //   }
      //
      //   return context.original.call(this, context.arguments)
      // })

      if (isFirefox || isChrome || isOpera) {
        // Implement
      }

      // Firefox does not inject content scripts into empty frames.
      // This is a major leak.
      // Let's beat them to the punch by using a MutationObserver
      // and patch up any iframes that are leaky.
      // if (isFirefox || isChrome || isOpera) {
      /**
       * Patches iframe's window.
       *
       * @param {HTMLIFrameElement} iframe
       */
      function patchIFrame (iframe: HTMLIFrameElement) {

        try {
          patch(iframe.contentWindow)
        } catch (e) {
          // Likely a security error which is ok since the content script will get
          // loaded on every frame.
          console.log(e)
        }
      }

      /**
       *
       * @param {Array<HTMLIFrameElement>} list
       * @param {Node} node
       */
      function findIFrames (list: Array<HTMLIFrameElement>, node: Node) {
        if (node.nodeName === 'IFRAME') {
          let iframe = node as HTMLIFrameElement
          patchIFrame(iframe)
          list.push(iframe)
        } else {
          if (node instanceof HTMLElement) {
            if (node.children && node.children.length > 0) {
              for (let i = 0; i < node.children.length; i++) {
                findIFrames(list, node.children[ i ])
              }
            }
          } else {
            if (node.childNodes && node.childNodes.length > 0) {
              for (let i = 0; i < node.childNodes.length; i++) {
                findIFrames(list, node.childNodes.item(i))
              }
            }
          }
        }
      }

      let iframeList = Array<HTMLIFrameElement>()

      let documentObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              let node = mutation.addedNodes[ i ]

              findIFrames(iframeList, node)

              // // Observe on body.
              // if (node.nodeName === 'BODY') {
              //   // iframeObserver(node as HTMLElement)
              // }
            }
          }
        })
      })

      // Start observing.
      documentObserver.observe(
        document.documentElement,
        {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        }
      )
      // }
      console.log(`Untraceable :(): Fingerprint Patch End: ${window.performance.now() - start} milliseconds`)
    }
    })(${profile})`

  if (window.self === window.top) {
    // Inject code.
    let script = document.createElement('script')
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script)
    // Clean up our tracks.
    script.remove()
  } else {
    // let iframe = window.frameElement
    // let par = iframe.parentNode
    // let sandbox = iframe.getAttribute("sandbox")
    // // Stop iframe from loading.
    // // window.stop()
    //
    // // localStorage.setItem('P', profile)
    // //
    // // Save the nextSibling node so the iframe may be inserted back to where it originally was.
    // let nextSibling = iframe.nextSibling
    // //
    // // // Remove from DOM.
    // par.removeChild(iframe)
    // //
    // // // Add "allow-scripts" to sandbox.
    // // // It's important to inherit the original value so we add it onto the end.
    // iframe.setAttribute("sandbox", sandbox === '' ? "allow-scripts" : sandbox + " allow-scripts")
    // // //
    // // Add back to DOM.
    // if (nextSibling)
    //   par.insertBefore(iframe, nextSibling)
    // else
    //   par.appendChild(iframe)
    //
    // // Revert sandbox back to original value.
    // // Since it has already been added back onto the DOM, this won't change
    // // the functionality. It makes it look as though nothing has changed.
    // iframe.setAttribute("sandbox", sandbox)
  }
}

function generateUUID () {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}
