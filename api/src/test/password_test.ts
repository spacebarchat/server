import { checkPassword } from "@fosscord/api";

console.log(checkPassword("123456789012345"));
// -> 0.25
console.log(checkPassword("ABCDEFGHIJKLMOPQ"));
// -> 0.25
console.log(checkPassword("ABC123___...123"));
// ->
console.log(checkPassword(""));
// ->
// console.log(checkPassword(""));
// // ->
