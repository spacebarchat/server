import { check } from "./../util/passwordStrength";

console.log(check("123456789012345"));
// -> 0.25
console.log(check("ABCDEFGHIJKLMOPQ"));
// -> 0.25
console.log(check("ABC123___...123"));
// ->
console.log(check(""));
// ->
// console.log(check(""));
// // ->
