// See https://aka.ms/new-console-template for more information

using ArcaneLibs;
using Spacebar.AdminApi.PrepareTestData.TestDataTypes;

Console.WriteLine("Hello, World!");
var tests = ClassCollector<ITestData>.ResolveFromAllAccessibleAssemblies();
foreach (var test in tests) {
    Console.WriteLine(test.Name);
}

Console.Write("Enter test type to run: ");
var testType = Console.ReadLine();
var testToRun = tests.FirstOrDefault(t => t.Name == testType);
var runMethod = testToRun?.GetMethod("Run");

if (runMethod != null) {
    Console.WriteLine($"Running test {testToRun.FullName}...");
    var task = runMethod.Invoke(testToRun, null) as Task;
    await task!;
    Console.WriteLine($"Test {testToRun.FullName} completed.");
} else {
    Console.WriteLine("Test not found.");
}