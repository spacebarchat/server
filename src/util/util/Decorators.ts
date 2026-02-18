import { BaseClassWithoutId } from "@spacebar/util*";

export const annotationsKey = Symbol("Annotations");

// Generates an array using the annotationsKey as a property on a class when annotated with the below decorators
export function initAnnotationMetadata(target: BaseClassWithoutId, propertyKey: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    target[annotationsKey] || (target[annotationsKey] = {});
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    target[annotationsKey][propertyKey] || (target[annotationsKey][propertyKey] = []);
}

// Adds to the generated array on the class with the annotation added.
export function addAnnotationMetadata(target: BaseClassWithoutId, propertyKey: string, annotation: string) {
    target[annotationsKey] = { ...target[annotationsKey], [propertyKey]: [...target[annotationsKey][propertyKey], annotation] };
}

export function JsonRemoveEmpty(target: BaseClassWithoutId, propertyKey: string) {
    initAnnotationMetadata(target, propertyKey);
    addAnnotationMetadata(target, propertyKey, "JsonRemoveEmpty");
}

export function BigintToLong(target: BaseClassWithoutId, propertyKey: string) {
    initAnnotationMetadata(target, propertyKey);
    addAnnotationMetadata(target, propertyKey, "BigintToLong");
}
