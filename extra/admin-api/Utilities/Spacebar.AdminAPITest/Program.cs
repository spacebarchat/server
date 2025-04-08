// See https://aka.ms/new-console-template for more information

using System.Net.Http.Json;
using ArcaneLibs.Extensions;

Console.WriteLine("Hello, World!");
using var hc = new HttpClient();
var response = hc.GetFromJsonAsAsyncEnumerable<object>("http://localhost:5112/users/1183568750931099679/deactivate");
await foreach (var item in response) {
    Console.WriteLine(item.ToJson(indent: false));
}
 