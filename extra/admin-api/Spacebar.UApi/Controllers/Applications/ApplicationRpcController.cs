using System.Text.Json.Serialization;
using ArcaneLibs.Collections;
using Microsoft.AspNetCore.Mvc;

namespace Spacebar.UApi.Controllers.Applications;

[ApiController]
[Route("/api/v{_}/applications/{applicationId}/")]
public class ApplicationRpcController : ControllerBase {
    private static LruCache<object> _rpcInfoCache = new(10000);
    // [HttpGet]
    // public async Task<object> GetApplicationRpcInfo(string applicationId) {
    //     
    // }

    [HttpGet("disclosures")]
    public ApplicationDisclosures GetApplicationDisclosures(string applicationId) {
        return new ApplicationDisclosures {
            Disclosures = [],
            AckedDisclosures = [],
            AllAcked = true
        };
    }

    [HttpPost("disclosures")]
    public ApplicationDisclosures AckApplicationDisclosures(string applicationId) {
        // TODO: type is wrong, normally only `disclosures` is returned
        return new ApplicationDisclosures {
            Disclosures = [],
            AckedDisclosures = [],
            AllAcked = true
        };
    }
}

public class ApplicationDisclosures {
    [JsonPropertyName("disclosures")]
    public List<ApplicationDisclosureType> Disclosures { get; set; }

    [JsonPropertyName("acked_disclosures")]
    public List<ApplicationDisclosureType> AckedDisclosures { get; set; }

    [JsonPropertyName("all_acked")]
    public bool AllAcked { get; set; }

    public enum ApplicationDisclosureType {
        UnspecifiedDisclosure = 0,
        IpLocation = 1,
        DisplaysAdvertisements = 2,
        PartnerSdkDataSharingMessage = 3
    }
}

public class RpcApplicationInfo {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("icon")]
    public string Icon { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("summary")]
    public string Summary { get; set; }
    
    [JsonPropertyName("type")]
    public ApplicationType? Type { get; set; } // what is this?

    [JsonPropertyName("verify_key")]
    public string VerifyKey { get; set; }
}

[Flags]
public enum ApplicationType {
    DeprecatedGame,
    Music,
    TicketedEvents,
    CreatorMonetization,
    Game
}