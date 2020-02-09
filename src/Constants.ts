export const SHORT_SIZE: number = 2;
export const FLOAT_SIZE: number = 4;
export const MATRIX_4X4_SIZE: number = 64;

// Attributes

export const POSITION_ATTRIBUTE: string = "aPosition";
export const COLOR_ATTRIBUTE: string = "aColor";
export const NORMAL_ATTRIBUTE: string = "aNormal";
export const UV0_ATTRIBUTE: string = "aUV0";
export const UV1_ATTRIBUTE: string = "aUV1";

export const INSTANCE_MATRIX_ATTRIBUTE = "iaMatrix";

export const POSITION_ATTRIBUTE_LOCATION: number = 0;
export const COLOR_ATTRIBUTE_LOCATION: number = 1;
export const NORMAL_ATTRIBUTE_LOCATION: number = 2;
export const UV0_ATTRIBUTE_LOCATION: number = 3;
export const UV1_ATTRIBUTE_LOCATION: number = 4;

export const INSTANCED_ATTRIBUTE_BASE_LOCATION: number = 5;

// Uniforms

export const MODEL_MATRIX_UNIFORM: string = "uModelMatrix";
export const VIEW_MATRIX_UNIFORM: string = "uViewMatrix";
export const PROJECTION_MATRIX_UNIFORM: string = "uProjectionMatrix";
export const VIEW_DIRECTION_PROJECTION_INVERSE_MATRIX_UNIFORM: string = "uViewDirectionProjectionInverseMatrix";
export const NORMAL_MATRIX_UNIFORM: string = "uNormalMatrix";

export const VIEW_POSITION_UNIFORM: string = "uViewPosition";
export const AMBIENT_LIGHT_UNIFORM: string = "uAmbientLight";
export const POINT_LIGHTS_DATA_UNIFORM: string = "uPointLightsData";
export const POINT_LIGHTS_COUNT_UNIFORM: string = "uPointLightsCount";

// Lighting

export const MAX_LIGHTS: number = 16;
export const LIGHT_DATA_SIZE: number = 2;