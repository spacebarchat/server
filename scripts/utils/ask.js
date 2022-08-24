const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function ask(question) {
	return new Promise((resolve, _reject) => {
		return rl.question(question, (answer) => {
			resolve(answer);
		});
	}).catch((err) => {
		console.log(err);
	});
}
async function askBool(question) {
	return /y?/i.test(await ask(question));
}

module.exports = {
    ask,
    askBool
}