namespace Spacebar.Tests.Extensions;

public static class AssertExtensions {
    extension(Assert) {
        public static void StringNotNullOrEmpty(string? str) {
            Assert.NotNull(str);
            Assert.NotEqual("", str);
        }

        public static void StringNotNullOrWhitespace(string? str) {
            StringNotNullOrEmpty(str);
            Assert.Matches(".+", str);
        }
    }
}