// See https://aka.ms/new-console-template for more information

using ArcaneLibs;
using Spacebar.AdminApi.PrepareTestData;
using Spacebar.AdminApi.PrepareTestData.TestDataTypes;

await Utils.PostFileWithDataAsync("http://localhost:3001/api/v9/channels/1324497120836834414/messages",
    "eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExODM1Njg3NTA5MzEwOTk2NzkiLCJpYXQiOjE3NDQyMTMxNzcsImtpZCI6IjdiMWM5OTBhMWQ1ZWI3MDVjMWFjNmIxOWYwNTVmMTM5Y2FiZDhhOTZmMzg3YTU1NDM3MDRhZDY0OTMyMzViYTMifQ.AUf87OS5DsWLfBR9VVF7emOE8cG8B4JLvktr2WxF9_XQsPd0X8da2s9f9Lq5pTmYe9zOaI7DrHMuggih3uZ9NmZzAfeasEgew4gCBKIcvhxSaKWcU9DMVHgZl-ZH5HnB0yk8l5IKzIV3z6wt9Ght-F_g5SRZiNlpthva0jU2QhRro3IB",
    new {
        content = "Hello world",
        nonce = Random.Shared.NextInt64()
    },
    File.ReadAllBytes("/home/Rory/Documents/kuromi_smug.png"), "test.png", "image/png");
return;
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
}
else {
    Console.WriteLine("Test not found.");
}