/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { BaseClassWithoutId } from "@spacebar/database";

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

export function JsonNumber(target: BaseClassWithoutId, propertyKey: string) {
    initAnnotationMetadata(target, propertyKey);
    addAnnotationMetadata(target, propertyKey, "JsonNumber");
}
