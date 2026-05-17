using ArcaneLibs.Collections;
using Spacebar.Models.Generic;

namespace Spacebar.Client.WebCore.Client;

public class ClientStateContainer {
    public ObservableDictionary<long, Guild> Guilds { get; set; } = [];
}