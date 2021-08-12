import { getSupportedRtpCapabilities } from "mediasoup";

async function test() {
	console.log(getSupportedRtpCapabilities());
}
setTimeout(() => {}, 1000000);

test();
