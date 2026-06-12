import type { ComponentRegistry } from './types';
export declare const componentRegistry: ComponentRegistry;
export declare function getComponentDefinition(type: string): import("./types").ComponentDefinition;
export declare function isRegisteredComponentType(type: string): type is keyof ComponentRegistry;
//# sourceMappingURL=registry.d.ts.map