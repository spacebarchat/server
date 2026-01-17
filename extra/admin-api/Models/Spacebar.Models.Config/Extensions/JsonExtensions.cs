using System.Text.Json;
using System.Text.Json.Nodes;

namespace Spacebar.ConfigModel.Extensions;

public static class JsonExtensions
{
    extension(Dictionary<string, string?> kv)
    {
        public JsonObject ToNestedJsonObject(string path = "$")
        {
            JsonObject root = new();
            // group by prefix
            var groups = kv.GroupBy(kvItem => kvItem.Key.Split('_', 2)[0]);
            foreach (var group in groups)
            {
                var prefix = group.Key;

                if (group.Count() == 1 && !group.First().Key.Contains('_'))
                {
                    root[prefix] = group.First().Value == null ? null : JsonNode.Parse(group.First().Value!);
                    Console.WriteLine("[CONFIG] Single Key: {0}.{1}, Value: {2}", path, prefix, root[prefix]?.ToJsonString());
                    continue;
                }

                var nestedValues = group.Where(x => x.Key.Contains('_')).ToDictionary(kvItem => kvItem.Key[(prefix.Length + 1)..], kvItem => kvItem.Value);

                if (nestedValues.All(x => int.TryParse(x.Key.Split('_')[0], out _)))
                {
                    Console.WriteLine("[CONFIG] Array Key Detected: {0}.{1}", path, prefix);
                    var arr = new JsonArray();
                    if (nestedValues.All(x => x.Key.Contains('_')))
                    {
                        var objs = nestedValues.GroupBy(x => x.Key.Split('_', 2)[0]);
                        foreach (var objGroup in objs.OrderBy(x => int.Parse(x.Key)))
                        {
                            var i = objGroup.Key;
                            var objValues = objGroup.ToDictionary(kvItem => kvItem.Key[(i.Length + 1)..], kvItem => kvItem.Value);
                            var obj = objValues.ToNestedJsonObject($"{path}.{prefix}[{i}]");
                            arr.Add(obj);
                            Console.WriteLine($" - ${path}.{prefix}[{i}]: {obj.ToJsonString()}");
                        }
                    }
                    else
                        foreach (var (i, arrayItem) in nestedValues.OrderBy(x => int.Parse(x.Key)))
                        {
                            arr.Add(arrayItem == null ? null : JsonNode.Parse(arrayItem));
                            Console.WriteLine($" - {path}.{prefix}[{i}]: {arrayItem}");
                        }

                    root[prefix] = arr;
                }
                else
                {
                    root[prefix] = nestedValues.ToNestedJsonObject($"{path}.{prefix}");
                }
            }

            return root;
        }
    }

    extension(JsonObject jo)
    {
        public Dictionary<string, string?> ToFlatKv(string path = "$")
        {
            var kv = new Dictionary<string, string?>();
            var jso = new JsonSerializerOptions()
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            foreach (var (key, value) in jo)
            {
                var currentPath = path == "$" ? key : $"{path}_{key}";

                switch (value)
                {
                    case JsonObject nestedObj:
                        var nestedKv = nestedObj.ToFlatKv(currentPath);
                        foreach (var (nestedKey, nestedValue) in nestedKv)
                        {
                            kv[nestedKey] = nestedValue;
                        }

                        break;
                    case JsonArray arr:
                        for (int i = 0; i < arr.Count; i++)
                        {
                            var item = arr[i];
                            var itemPath = $"{currentPath}_{i}";
                            switch (item)
                            {
                                case JsonObject arrObj:
                                    var arrObjKv = arrObj.ToFlatKv(itemPath);
                                    foreach (var (arrObjKey, arrObjValue) in arrObjKv)
                                    {
                                        kv[arrObjKey] = arrObjValue;
                                    }

                                    break;
                                default:
                                    kv[itemPath] = item?.ToJsonString(jso);
                                    break;
                            }
                        }

                        break;
                    default:
                        Console.WriteLine(value?.GetType());
                        kv[currentPath] = value?.ToJsonString(jso);
                        break;
                }
            }

            return kv;
        }
    }
}