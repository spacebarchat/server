using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Replication.Abstractions;

namespace Spacebar.GatewayOffload.Controllers;

[ApiController]
[Route("/_spacebar/offload/gateway/LazyRequest")]
public class Op14Controller : ControllerBase {
    [HttpPost]
    public async IAsyncEnumerable<ReplicationMessage> DoLazyRequest() {
        yield break;
    }
}