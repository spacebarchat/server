export function formatFile(filePath: string, content: string): string {
    let startTime = Date.now();
    
    if(filePath.endsWith(".css")) {
        content = formatCss(content);
    } else if(filePath.endsWith(".js")) {
        content = formatJs(content);
    }

    console.log(`[CodeFormatter] Formatted ${filePath} in ${Date.now() - startTime}ms`);
    return content;
}

function unfoldBlocks(content: string): string{
    content = content.replaceAll("{", "{\n");
    content = content.replaceAll("}", "\n}\n");
    content = content.replaceAll(";", ";\n");
    return content;
}

function formatCss(content: string): string {
    content = unfoldBlocks(content);

    return content;
}
//simple js formatter...  this was absolute pain...
function formatJs(content: string): string {
    content = content.replaceAll("{", "{\n");
    content = content.replaceAll("}", "\n}\n");
    content = content.replaceAll(";", ";\n");
    content = content.replaceAll(":\"", ": \"");
    content = content.replaceAll(/(\w)=\"/g, "\$1 = \"");

    content = content.replaceAll("function(){", "function() {");
    //undo webpacking, improves performance and debugging
    // - booleans
    content = content.replaceAll("return!", "return !");
    content = content.replace(/!0/g, "true");
    content = content.replace(/!1/g, "false");
    // - real esmodule defs, slightly faster
    content = content.replace(/Object.defineProperty\((.), "__esModule", { value: (.*) }\);/g, '\$1.__esModule = \$2;');

    //fix accidentals
    content = content.replaceAll(";\n\"", ";\"");
    content = content.replaceAll("{\n\n}", "{}");
    content = content.replaceAll("\\{\n", "\\{");
    content = content.replaceAll("\\\n}", "\\}");

    content = content.replaceAll("\\}\n", "\\}");
    content = content.replaceAll("}\n\"", "}\"");
    content = content.replaceAll("{\n [polyfill code] \n}\"", "{ [polyfill code] }\"");
    content = content.replaceAll(";\n ", "; ");
    // --regex--
    content = content.replaceAll(/\{\n(\w{1,4})\n\}/g, '{\$1}')
    content = content.replaceAll(/\{\n(\w{1,4},\w{0,4})\n\}/g, '{\$1}')
    content = content.replaceAll("}\n)", "})")
    content = content.replaceAll("}\n|", "}|")
    content = content.replaceAll("}\n\\s", "}\\s")
    content = content.replaceAll("}\n$", "}$")
    content = content.replaceAll("}\n\\", "}\\")
    // --!regex--

    content = content.replaceAll("\n\\n", "\\n")
    content = content.replaceAll("  {\n", " {");
    content = content.replaceAll("\n}\\n", "}\\n");
    content = content.replaceAll(";\nbase64,", ";base64,");
    content = content.replaceAll(/!!{\n(\w*)\n}\n!!/g, "!!{\$1}!!");
    content = content.replaceAll("}\n!!", "}!!");
    content = content.replaceAll("}\n**", "}**");
    content = content.replaceAll("}\nx", "}x");
    content = content.replaceAll(/{\n(\w*)\n}/g, "{\$1}");
    content = content.replaceAll("\",\n\"", "\",\"");
    while(/(\w) {\n([^\}\.]*)\n?}/g.test(content))
        content = content.replaceAll(/(\w) {\n?([^\}\.]*)\n?}/g, "\$1 {\$2}");
    //no double newlines
    while(content.includes("\n\n"))
        content = content.replaceAll("\n\n", "\n");

    return content;
}