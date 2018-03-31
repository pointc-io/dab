interface UtBrowser {

}

interface UtString {

}

interface UtWebGL2 {

}

interface UtWebGL {
  renderer?: string;
  shadingLanguageVersion?: string;
  vendor?: string;
  version?: string;
  unmaskedVendor?: string;
  unmaskedRenderer?: string;
  extensionsId?: string;
  aliasedLineWidthRangeLow?: number;
  aliasedLineWidthRangeHigh?: number;
  aliasedPointLineRangeLow?: number;
  aliasedPointLineRangeHigh?: number;
  redBits?: number;
  greenBits?: number;
  blueBits?: number;
  alphaBits?: number;
  stencilBits?: number;
  depthBits?: number;
  maxAnisotropy?: number;
  maxCombinedTextureImageUnits?: number;
  maxCubeMapTextureSize?: number;
  maxFragmentUniformVectors?: number;
  maxRenderBufferSize?: number;
  maxTextureImageUnits?: number;
  maxTextureSize?: number;
  maxVaryingVectors?: number;
  maxVertexAttribs?: number;
  maxVertexTextureImageUnits?: number;
  maxVertexUniformVectors?: number;
  maxViewportWidth?: number;
  maxViewportHeight?: number;
  contextAttributes?: UtWebGLContextAttributes;
  vertexShaderHighFloat?: UtWebGLShader;
  vertexShaderMediumFloat?: UtWebGLShader;
  vertexShaderLowFloat?: UtWebGLShader;
  fragmentShaderHighFloat?: UtWebGLShader;
  fragmentShaderMediumFloat?: UtWebGLShader;
  fragmentShaderLowFloat?: UtWebGLShader;
  vertexShaderHighInt?: UtWebGLShader;
  vertexShaderMediumInt?: UtWebGLShader;
  vertexShaderLowInt?: UtWebGLShader;
  fragmentShaderHighInt?: UtWebGLShader;
  fragmentShaderMediumInt?: UtWebGLShader;
  fragmentShaderLowInt?: UtWebGLShader;
}

interface UtWebGLContextAttributes {
  alpha?: boolean;
  antialias?: boolean;
  depth?: boolean;
  failIfMajorPerformanceCaveat?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  stencil?: boolean;
}

interface UtWebGLExtension {
  sort?: number;
  name?: string;
}

interface UtWebGLShader {
  precision?: number;
  rangeMin?: number;
  rangeMax?: number;
}

interface UtCanvas {

}

interface UtSystemColors {
  ActiveBorder?: string;
  ActiveCaption?: string;
  AppWorkspace?: string;
  Background?: string;
  ButtonFace?: string;
  ButtonHighlight?: string;
  ButtonShadow?: string;
  ButtonText?: string;
  CaptionText?: string;
  GrayText?: string;
  Highlight?: string;
  HighlightText?: string;
  InactiveBorder?: string;
  InactiveCaption?: string;
  InactiveCaptionText?: string;
  InfoBackground?: string;
  InfoText?: string;
  Menu?: string;
  MenuText?: string;
  Scrollbar?: string;
  ThreeDDarkShadow?: string;
  ThreeDFace?: string;
  ThreeDHighlight?: string;
  ThreeDLightShadow?: string;
  ThreeDShadow?: string;
  Window?: string;
  WindowFrame?: string;
  WindowText?: string;
}

interface UtFonts {
  cssCount?: number;
  cssMD5?: string;
  flashCount?: number;
  flashMD5?: string;
}

interface UtCollator {

}

interface UtNavigator {
  model?: UtJsModel;
}

interface UtBattery {
  model?: UtJsModel;
}

interface UtMediaDevices {
  model?: UtJsModel;
}

interface UtMediaDevice {
  model?: UtJsModel;
}

interface UtPlugins {
  length: number;
}

interface UtMimeTypes {

}

interface UtMimeType {

}

interface UtPlugin {

  mimeTypes?: UtPluginMimeType[];
  description?: string;
  filename?: string;
  length?: number;
  name?: string;
  version?: string;
}

interface UtPluginMimeType {
  index?: any;
  globalIndex?: number;
}

interface UtBluetooth {

}

interface UtServiceWorker {

}

interface UtGeolocation {

}

interface UtScreen {
  order?: string[];
  model?: UtJsModel;

  width?: number;
  height?: number;
  availWidth?: number;
  availHeight?: number;
  availTop?: number;
  availLeft?: number;
  pixelDepth?: number;
  colorDepth?: number;
  left?: number;
  top?: number;

  mozOrientation?: string;
}

interface UtScreenOrientation {
  angle?: number;
  type?: string;
}

interface UtNetworkInformation {
  downlink?: number;
  downlinkMax?: any;
  effectiveType?: string;
  rtt?: number;
  type?: string;
}

interface UtBattery {
  model?: UtJsModel;
  charging?: boolean;
  chargingTime?: number;
  dischargingTime?: number;
  level?: number;
}

interface UtMediaDevices {
  model?: UtJsModel;
  devices?: UtMediaDevice[];
}

interface UtMediaDevice {
  deviceId?: string;
  groupId?: string;
  kind?: string;
  label?: string;
  toStringValue?: string;
}

interface UtJsModel {
  name?: string;
  toStringValue?: string;
  fields?: UtJsProperty[];
  protoName?: string;
  protoToString?: string;
}

interface UtJsProperty {
  name?: string;
  type?: string;
  value?: string;
  toStringValue?: string;
  toLocaleStringValue?: string;
}

interface UtWindow {
  offscreenBuffering?: boolean;

  devicePixelRatio?: number;
  innerWidth?: number;
  innerHeight?: number;
  outerHeight?: number;
  outerWidth?: number;
  pageXOffset?: number;
  pageYOffset?: number;

  screenLeft?: number;
  screenTop?: number;
  screenX?: number;
  screenY?: number;
  scrollX?: number;
  scrollY?: number;

  // Moz
  mozInnerScreenX?: number;
  mozInnerScreenY?: number;
  mozPaintCount?: number;
  scrollMinX?: number;
  scrollMinY?: number;
  scrollMaxX?: number;
  scrollMaxY?: number;
}
