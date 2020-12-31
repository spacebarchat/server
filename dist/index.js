"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
const server = new Server_1.Server();
server
    .init()
    .then(() => {
    console.log("[Server] started on :" + server.options.port);
})
    .catch((e) => console.error("[Server] Error starting: ", e));
//// server
//// 	.destroy()
//// 	.then(() => console.log("[Server] closed."))
//// .catch((e) => console.log("[Server] Error closing: ", e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBa0M7QUFFbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztBQUM1QixNQUFNO0tBQ0osSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDLENBQUM7S0FDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUU5RCxXQUFXO0FBQ1gsZ0JBQWdCO0FBQ2hCLGtEQUFrRDtBQUNsRCwrREFBK0QifQ==