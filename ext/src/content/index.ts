let PROFILE = JSON.stringify({
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

  navigator: {
    // appCodeName: 'UT',
    // appVersion: '1.0',
    platform: 'MacIntel',
    // userAgent: 'Modilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.2228.0 Safari/537.36',

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

  webGL: {
    extensions: []
  },

  webGL2: {
    extensions: []
  },

  pixels: [
    {
      x: 0.23,
      y: 0.10,
      r: 255.0,
      g: 36.0,
      b: 0.0,
    }
  ]
})

const start = window.performance.now()
const $log = console.log

function log (value: any) {
  $log(value)
}

if (window.self === window.top) {
  const KEY = 'P'
  const REQUEST = {
    type: KEY,
  }

  // Connect to background page.
  let PORT = browser.runtime.connect('', { name: KEY })
  // Listen for messages
  PORT.onMessage.addListener((message: any) => {
    console.log(`RECEIVED MESSAGE in ${window.performance.now() - start} ms`)
  })
  // Notify background
  PORT.postMessage(REQUEST)

  // Generate inject code
  const injectCode = `(${function (DEVICE: any) {
    /**
     * Log out to console
     *
     * @param value
     */
    // function log (value: any) {
    //   $log(value)
    // }

    /**
     *
     * @param v
     * @returns {boolean}
     */
    function isSet (v: any): boolean {
      return v !== null && v !== undefined
    }

    /**
     *
     * @param {string} path
     * @returns {any}
     * @constructor
     */
    function $model (...path: string[]): any {
      if (!path || path.length === 0) {
        return null
      }

      let model = DEVICE
      for (let i = 0; i < path.length; i++) {
        model = model[ path[ i ] ]

        if (!isSet(model)) {
          return null
        }
      }
      return model
    }

    /**
     *
     * @param or
     * @param graph
     * @param {string} path
     * @returns {any}
     * @constructor
     */
    function $valFor (or: any, graph: any, ...path: string[]): any {
      if (!path || path.length === 0) {
        return or
      }

      let model = graph
      for (let i = 0; i < path.length; i++) {
        model = model[ path[ i ] ]

        if (!isSet(model)) {
          return or
        }
      }
      return model
    }

    /**
     *
     * @param or
     * @param {string} path
     * @returns {any}
     * @constructor
     */
    function $val (or: any, ...path: string[]): any {
      return $valFor(or, DEVICE, ...path)
    }

    let isFirefox = window.hasOwnProperty('mozInnerScreenX')
    let isChrome = window.hasOwnProperty('chrome')
    let isOpera = window.hasOwnProperty('opera')
    // let isEdge = false
    // let isSafari = false

    let $getOwnPropertyDescriptors = Object[ 'getOwnPropertyDescriptors' ]
    let $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
    let $getOwnPropertyNames = Object.getOwnPropertyNames

    // Interceptor map
    let $interceptorMap = new WeakMap<any, any>()

    // interface Warning {
    //   level: number
    //   type: string
    //   message: string
    // }
    //
    // let WARNINGS = []
    //
    // function addWarning (warning: Warning) {
    //   WARNINGS.push(warning)
    // }

    /**
     * Shim to patch Function.prototype.toString/toSource on intercepted/overridden property.
     */
    class Interceptee {
      constructor (public base: any) {
      }

      toString () {
        // Map toString to the base value
        return this.base.toString()
      }

      toSource () {
        // Map toSource to the base value
        return this.base.toSource()
      }
    }

    /**
     *
     */
    class Prototype {
      constructor (public proto: any) {
      }

      /**
       * Intercepts
       * @param {string} name
       * @param {(base: (thisArg: any, argArray?: any) => any) => any} provider
       */
      intercept (name: string, provider: (base: (thisArg: any, argArray?: any) => any) => any): boolean {
        let descriptor = $getOwnPropertyDescriptor(this.proto, name)

        if (!descriptor) {
          return false
        }

        let base = descriptor.get || descriptor.value

        let override = provider((thisArg: any, argArray?: any): any => {
          if (descriptor.get) {
            return descriptor.get.apply(thisArg, argArray)
          } else if (descriptor.value && descriptor.value instanceof Function) {
            return descriptor.value.apply(thisArg, argArray)
          } else {
            return descriptor.value
          }
        })

        if (isSet(override)) {
          this.override(name, descriptor, base, override)
          return true
        } else {
          return false
        }
      }

      /**
       * Iterates through all defined properties and calls a supplied provider to provide
       * the new overriden value. If null is provided then the default descriptor remains.
       *
       * @param {(name: string, base: (thisArg: any, argArray?: any) => any) => any} provider
       */
      define (provider: (name: string, base: (thisArg: any, argArray?: any) => any) => any) {
        let proto = this.proto
        let names = $getOwnPropertyNames(proto)

        // Iterate through original descriptors.
        for (let i = 0; i < names.length; i++) {
          let name = names[ i ]
          let descriptor = $getOwnPropertyDescriptor(proto, name)
          if (!descriptor) {
            continue
          }
          let base = descriptor.get || descriptor.value

          let override = provider(name, function b (thisArg: any, argArray?: any): any {
            if (base && base instanceof Function) {
              return base.apply(thisArg, argArray)
            } else {
              return base
            }
          })

          if (isSet(override)) {
            this.override(name, descriptor, base, override)
          } else {
            try {
              Object.defineProperty(this.proto, name, descriptor)
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      /**
       *
       * @param {string} name
       * @param {PropertyDescriptor} baseDescriptor
       * @param base
       * @param model
       */
      override (name: string,
                baseDescriptor: PropertyDescriptor,
                base: any,
                model: any) {
        if (!(model instanceof Function)) {
          let shimProps = $getOwnPropertyNames(model)
          let getter = shimProps && shimProps.length > 0
            ? $getOwnPropertyDescriptor(model, shimProps[ 0 ])
            : null
          if (getter && getter.get) {
            model = getter.get
          }
        }

        let descriptor = {}
        let descriptors = $getOwnPropertyDescriptors(baseDescriptor)
        for (let name in descriptors) {
          let d = descriptors[ name ]

          switch (name) {
            case 'get':
              if (!d.value) {
                continue
              }

              let value
              if (model instanceof Function) {
                if (d.value.name === '') {
                  let sh = model
                  value = function () {
                    return sh.apply(this, arguments)
                  }
                } else {
                  value = model
                }
              } else {
                let sh = model
                value = function () {
                  return sh
                }
              }

              descriptor[ 'get' ] = value
              $interceptorMap.set(value, new Interceptee(base))
              break

            case 'set':
              break

            case 'value':
              descriptor[ 'value' ] = model
              $interceptorMap.set(descriptor[ 'value' ], new Interceptee(base))
              break

            default:
              Object.defineProperty(descriptor, name, d)
              break
          }
        }

        Object.defineProperty(this.proto, name, descriptor)
      }

      /**
       *
       * @param {string} name
       * @returns {any}
       */
      value (name: string): any {
        let descriptor = $getOwnPropertyDescriptor(this.proto, name)
        return descriptor ? descriptor.value : null
      }
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

    /**
     *
     */
    class Patch {
      private $function: Prototype
      private $screen: Prototype
      private $orientation: Prototype
      private $navigator: Prototype
      private $network: Prototype
      private $webGL: Prototype
      private $webGL2: Prototype
      private $canvas: Prototype

      private VERT_SRC = '\
precision mediump float;\
attribute float xoffset;\
uniform float yoffset;\
void main() {\
  gl_Position = vec4(xoffset, yoffset, 0, 1);\
}'

      private FRAG_SRC = '\
precision mediump float;\
uniform vec3 color;\
void main() {\
  gl_FragColor = vec4(color,1);\
}'

      // private GL_WATERMARK_LENGTH = 1

      constructor (win: any) {
        function of (...path: string[]): Prototype {
          let o = win
          for (let i = 0; i < path.length; i++) {
            o = o[ path[ i ] ]
            if (!o) {
              return null
            }
          }
          return new Prototype(o)
        }

        this.$function = of('Function', 'prototype')
        this.$screen = of('Screen', 'prototype')
        this.$orientation = of('ScreenOrientation', 'prototype')
        this.$navigator = of('Navigator', 'prototype')
        this.$network = of('NetworkInformation', 'prototype')
        this.$canvas = of('HTMLCanvasElement', 'prototype')
        this.$webGL = of('WebGLRenderingContext', 'prototype')
        this.$webGL2 = of('WebGL2RenderingContext', 'prototype')
      }

      apply () {
        // Patch function.
        this.func()
        // Patch Object.
        // patchObject(new ProtoDef(objectStaticDef), new ProtoDef(objectDef))
        // Patch screen.
        this.screen()
        // Patch navigator.
        this.navigator()

        if (this.$webGL) {
          this.webGL()
        }
        if (this.$webGL2) {
          this.webGL2()
        }
        if (this.$canvas) {
          this.canvas()
        }
      }

      /**
       * Function.prototype is leak central! Every single patch is a user defined
       * function which leaks it's own source code. This exposes the user to the
       * fact that's it's been tampered with.
       *
       * @param {any} win
       * @param {Prototype} proto
       */
      func () {
        let d = $getOwnPropertyDescriptor(this.$function.proto, 'toString')
        if (d) {
          let base = d.value
          d.value = function toString () {
            let interceptor = $interceptorMap.get(this)
            if (interceptor) {
              return interceptor.toString()
            }

            return base.apply(this, arguments)
          }
          $interceptorMap.set(d.value, base.toString())
          Object.defineProperty(this.$function.proto, 'toString', d)
        }
        d = $getOwnPropertyDescriptor(this.$function.proto, 'toSource')
        if (d) {
          let base = d.value
          d.value = function toSource () {
            let interceptor = $interceptorMap.get(this)
            if (interceptor) {
              return interceptor.toString()
            }

            return base.apply(this, arguments)
          }
          $interceptorMap.set(d.value, base.toString())
          Object.defineProperty(this.$function.proto, 'toSource', d)
        }
      }

      /**
       *
       * @param {Prototype} proto
       */
      screen () {
        this.$screen.define((name, base) => {
          switch (name) {
            case 'availHeight':
              return {
                get availHeight () {
                  return $val(
                    base(this, arguments),
                    'screen', 'availHeight'
                  )
                }
              }

            case 'availLeft':
              return {
                get availLeft () {
                  return $val(
                    base(this, arguments),
                    'screen', 'availLeft'
                  )
                }
              }

            case 'availTop':
              return {
                get availTop () {
                  return $val(
                    base(this, arguments),
                    'screen', 'availTop'
                  )
                }
              }

            case 'availWidth':
              return {
                get availWidth () {
                  return $val(
                    base(this, arguments),
                    'screen', 'availWidth'
                  )
                }
              }

            case 'colorDepth':
              return {
                get colorDepth () {
                  return $val(
                    base(this, arguments),
                    'screen', 'colorDepth'
                  )
                }
              }

            case 'left':
              return {
                get left () {
                  return $val(
                    base(this, arguments),
                    'screen', 'left'
                  )
                }
              }

            case 'width':
              return {
                get width () {
                  return $val(
                    base(this, arguments),
                    'screen', 'width'
                  )
                }
              }

            case 'height':
              return {
                get height () {
                  return $val(
                    base(this, arguments),
                    'screen', 'height'
                  )
                }
              }

            case 'mozOrientation':
              return {
                get mozOrientation () {
                  return $val(
                    base(this, arguments),
                    'screen', 'mozOrientation'
                  )
                }
              }

            case 'orientation':
              // Patch ScreenOrientation.prototype
              this.orientation()

              // Orientation's prototype is intercepted so no need to intercept it's getter.
              return null

            case 'pixelDepth':
              return {
                get pixelDepth () {
                  return $val(
                    base(this, arguments),
                    'screen', 'pixelDepth'
                  )
                }
              }

            case 'top':
              return {
                get top () {
                  return $val(
                    base(this, arguments),
                    'screen', 'top'
                  )
                }
              }
          }
          return null
        })
      }

      /**
       *
       */
      orientation () {
        let model = $model('screen', 'orientation')
        if (!model || !this.$orientation) {
          return
        }

        this.$orientation.define((name, base) => {
          switch (name) {
            case 'angle':
              return {
                get angle () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'angle'
                  )
                }
              }

            case 'type':
              return {
                get type () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'type'
                  )
                }
              }
          }
          return null
        })
      }

      /**
       *
       * @param {Prototype} proto
       */
      navigator () {
        this.$navigator.define((name, base) => {
          switch (name) {
            case 'appCodeName':
              return {
                get appCodeName () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'appCodeName'
                  )
                }
              }

            case 'appName':
              return {
                get appName () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'appName'
                  )
                }
              }

            case 'appVersion':
              return {
                get appVersion () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'appVersion'
                  )
                }
              }

            case 'bluetooth':
              return null

            case 'budget':
              return null

            case 'network':
              this.network()
              return null

            case 'cookieEnabled':
              return null

            case 'credentials':
              return null

            case 'deviceMemory':
              return {
                get deviceMemory () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'deviceMemory'
                  )
                }
              }

            case 'doNotTrack':
              return {
                get doNotTrack () {
                  return $val(
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
                  return $val(
                    base(this, arguments),
                    'navigator', 'hardwareConcurrency'
                  )
                }
              }

            case 'language':
              return {
                get language () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'language'
                  )
                }
              }

            case 'languages':
              return {
                get languages () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'languages'
                  )
                }
              }

            case 'maxTouchPoints':
              return {
                get maxTouchPoints () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'maxTouchPoints'
                  )
                }
              }

            case 'mediaDevices':
              this.mediaDevices()
              return null

            case 'mimeTypes':
              this.mimeTypes()
              return null

            case 'onLine':
              return {
                get maxTouchPoints () {
                  return $val(
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
                  return $val(
                    base(this, arguments),
                    'navigator', 'platform'
                  )
                }
              }

            case 'plugins':
              this.plugins()
              return null

            case 'presentation':
              return null

            case 'product':
              return {
                get product () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'product'
                  )
                }
              }

            case 'productSub':
              return {
                get productSub () {
                  return $val(
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

            case 'userAgent2':
              return {
                get userAgent () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'userAgent'
                  )
                }
              }

            case 'vendor':
              return {
                get vendor () {
                  return $val(
                    base(this, arguments),
                    'navigator', 'vendor'
                  )
                }
              }

            case 'vendorSub':
              return {
                get vendor () {
                  return $val(
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

      /**
       *
       */
      network () {
        let model = $model('navigator', 'network')
        if (!model || !this.$network) {
          return
        }

        this.$network.define((name, base) => {
          switch (name) {
            case 'downlink':
              return {
                get downlink () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'downlink'
                  )
                }
              }

            case 'effectiveType':
              return {
                get effectiveType () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'effectiveType'
                  )
                }
              }

            case 'rtt':
              return {
                get rtt () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'rtt'
                  )
                }
              }

            case 'saveData':
              return {
                get saveData () {
                  return $valFor(
                    base(this, arguments),
                    model,
                    'saveData'
                  )
                }
              }
          }
          return null
        })
      }

      /**
       *
       */
      mediaDevices () {
        // TODO:
      }

      /**
       *
       */
      plugins () {
        // TODO:
      }

      /**
       *
       */
      mimeTypes () {
        // TODO:
      }

      /**
       *
       * @param gl
       * @param type
       * @param src
       * @returns {WebGLShader}
       */
      compileShader (gl, type, src) {
        let shader = gl.createShader(type)
        gl.shaderSource(shader, src)
        gl.compileShader(shader)
        return shader
      }

      /**
       *
       * @param gl
       */
      watermark (gl) {
        let pixels = $model('pixels')
        if (!pixels) {
          return
        }

        let width = gl.canvas.width
        let height = gl.canvas.height
        let wUnit = 2.0 / width
        let hUnit = 2.0 / height

        function calcPoint (size, placement) {
          if (placement < 0.0) {
            placement = 0.0
          } else if (placement > 1.0) {
            placement = 1.0
          }
          let coord = Math.floor((size - 1) * placement)
          if (coord < 0) {
            coord = 0
          }
          if (coord >= size) {
            coord = size - 1
          }
          return coord
        }

        let fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, this.FRAG_SRC)
        let vertShader = this.compileShader(gl, gl.VERTEX_SHADER, this.VERT_SRC)

        let program = gl.createProgram()
        gl.attachShader(program, fragShader)
        gl.attachShader(program, vertShader)
        gl.bindAttribLocation(program, 0, 'xoffset')
        gl.linkProgram(program)

        gl.useProgram(program)

        let uY = gl.getUniformLocation(program, 'yoffset')
        let uColor = gl.getUniformLocation(program, 'color')

        let buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -0.5, 0.5 ]), gl.STATIC_DRAW)

        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0)

        function moveX (x, length) {
          if (x > width) {
            x = 1.0
          } else if (x < 0) {
            x = -1.0
          } else {
            x = wUnit * x - 1
          }

          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ x, x + (wUnit * length) ]), gl.STATIC_DRAW)
        }

        function convertColor (color) {
          return color * (2.0 / 255.0) - 1.0
        }

        function calcY (y) {
          return y * hUnit - 1.0
        }

        function drawLine (x, y, color) {
          moveX(x, this.GL_WATERMARK_LENGTH)
          y = calcY(y)
          gl.useProgram(program)
          gl.uniform1f(uY, y)
          gl.uniform3fv(uColor, color)
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.drawArrays(gl.LINES, 0, 2)
        }

        gl.viewport(0, 0, width, height)
        gl.lineWidth(1)

        for (let i = 0; i < pixels.length; i++) {
          let pixel = pixels[ i ]

          drawLine(
            calcPoint(width, pixel.x),
            calcPoint(height, pixel.y),
            [
              convertColor(pixel.r),
              convertColor(pixel.g),
              convertColor(pixel.b)
            ]
          )
        }
      }

      /**
       *
       * @param {Prototype} proto
       */
      webGL () {
        if (!this.$webGL) {
          return
        }

        this.$webGL.intercept('readPixels', base => {
          return function readPixels () {
            this.watermark(this)
            return base(this, arguments)
          }
        })

        this.$webGL.intercept('getSupportedExtensions', base => {
          return function getSupportedExtensions () {

            let value = base(this, arguments)
            // console.log(value)

            return value
          }
        })

        this.$webGL.intercept('getParameter', base => {
          return function getParameter () {
            switch (arguments[ 0 ]) {
              case WebGLRenderingContext.VERSION:
                return 'UT.1.0.3'
            }

            let value = base(this, arguments)
            // console.log(value)

            return value
          }
        })
      }

      /**
       *
       */
      webGL2 () {
        if (!this.$webGL2) {
          return
        }

        this.$webGL2.intercept('readPixels', base => {
          return function readPixels (p1, p2, p3, p4, p5, p6, p7) {
            this.watermark(this)
            return base(this, arguments)
          }
        })

        this.$webGL2.intercept('getSupportedExtensions', base => {
          return function getSupportedExtensions () {

            let value = base(this, arguments)
            // console.log(value)

            return value
          }
        })

        this.$webGL2.intercept('getParameter', base => {
          return function getParameter () {
            switch (arguments[ 0 ]) {
              case WebGLRenderingContext.VERSION:
                return 'UT.1.0.3'
            }

            let value = base(this, arguments)
            // console.log(value)

            return value
          }
        })
      }

      /**
       *
       * @param {Prototype} proto
       */
      canvas () {
        // Cache pointer to 'getImageData' to ensure it's not intercepted by a user script
        let $getImageData = this.$canvas.value('getImageData')
        let pixels = $model('pixels')

        this.$canvas.intercept('toDataURL', base => {
          return function toDataURL () {
            let canvasWidth = this.width
            let canvasHeight = this.height

            if (canvasWidth < 1 || canvasHeight < 1) {
              return base(this, arguments)
            }

            if (!pixels) {
              return base(this, arguments)
            }

            function calculatePlacement (size, placement) {
              if (placement < 0.0) {
                placement = 0.0
              } else if (placement > 1.0) {
                placement = 1.0
              }
              let coord = Math.floor((size - 1) * placement)
              if (coord < 0) {
                coord = 0
              }
              if (coord >= size) {
                coord = size - 1
              }
              return coord
            }

            let ctx = null
            try {
              ctx = this.getContext('2d')
            } catch (e) {
              // Ignore
            }

            if (ctx) {
              let writePixel = function (canvasData, _x, _y, _r, _g, _b, _a) {
                let index = (_x + _y * canvasWidth) * 4
                canvasData.data[ index ] = _r
                canvasData.data[ index + 1 ] = _g
                canvasData.data[ index + 2 ] = _b
                canvasData.data[ index + 3 ] = _a
              }

              // Modify ImageData directly.
              let canvasData = $getImageData.apply(ctx, 0, 0, canvasWidth, canvasHeight)
              // Write Pixels.
              for (let p = 0; p < pixels.length; p++) {
                let pixl = pixels[ p ]
                writePixel(
                  canvasData,
                  calculatePlacement(canvasWidth, pixl.x),
                  calculatePlacement(canvasHeight, pixl.y), pixl.r, pixl.g, pixl.b, pixl.a
                )
              }
              // Put image data back.
              ctx.putImageData(canvasData, 0, 0)
            } else {
              try {
                ctx = this.getContext('webgl2') || this.getContext('webgl') || this.getContext('webgl-experimental')
              } catch (e) {
                // Ignore
              }

              if (ctx) {
                this.watermark(ctx)
              }
            }

            return base(this, arguments)
          }
        })
      }
    }

    // Apply patch
    new Patch(window).apply()

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
        new Patch(iframe.contentWindow).apply()
        // patch(iframe.contentWindow)
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
    function patchIFrames (list: Array<HTMLIFrameElement>, node: Node) {
      if (node.nodeName === 'IFRAME') {
        let iframe = node as HTMLIFrameElement
        patchIFrame(iframe)
      } else {
        if (node instanceof HTMLElement) {
          if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
              patchIFrames(list, node.children[ i ])
            }
          }
        } else {
          if (node.childNodes && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
              patchIFrames(list, node.childNodes.item(i))
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
            patchIFrames(iframeList, node)
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
        characterData: false,
        subtree: true
      }
    )
    // }
  }})(${PROFILE})`

  // Inject code.
  let script = document.createElement('script')
  script.textContent = injectCode;
  (document.head || document.documentElement).appendChild(script)
  // Clean up our tracks.
  script.remove()

  log(`Untraceable Fingerprint Patched in ${window.performance.now() - start} milliseconds`)
}

// function generateUUID () {
//   let d = new Date().getTime()
//   let uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//     let r = (d + Math.random() * 16) % 16 | 0
//     d = Math.floor(d / 16)
//     return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
//   })
//   return uuid
// }
