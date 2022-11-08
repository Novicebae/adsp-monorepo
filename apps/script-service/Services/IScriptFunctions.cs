
using Adsp.Platform.ScriptService.Services.Platform;
using Adsp.Platform.ScriptService.Services.Util;
using Adsp.Sdk;
using NLua;
using RestSharp;
namespace Adsp.Platform.ScriptService.Services;
interface IScriptFunctions
{

  string? GeneratePdf(string templateId, string filename, object values);
  IDictionary<string, object?>? GetConfiguration(string @namespace, string name);
  FormDataResult? GetFormData(string formId);
  string? CreateTask(
    string queueNamespace, string queueName, string name,
    string? description = null, string? recordId = null, string? priority = null, LuaTable? context = null
  );
}
