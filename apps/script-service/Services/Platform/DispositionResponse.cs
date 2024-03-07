using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using Adsp.Sdk.Util;

namespace Adsp.Platform.ScriptService.Services.Platform;
[SuppressMessage("Usage", "CA2227: Collection properties should be read only", Justification = "Data transfer object")]
[SuppressMessage("Usage", "CA1812: Avoid uninstantiated internal classes", Justification = "For deserialization")]
internal sealed class DispositionResponse
{
  [JsonPropertyName("created")]
  public string? Created { get; set; }

  [JsonPropertyName("createdBy")]
  public CreatedBy? CreatedBy { get; set; }

  [JsonPropertyName("definitionId")]
  public string? DefinitionId { get; set; }

  [JsonPropertyName("disposition")]
  public Disposition? Disposition { get; set; }

  [JsonPropertyName("formData")]
  public object? FormData { get; set; }

  [JsonPropertyName("formFiles")]
  public object? FormFiles { get; set; }

  [JsonPropertyName("formId")]
  public string? FormId { get; set; }

  [JsonPropertyName("id")]
  public string? Id { get; set; }

  [JsonPropertyName("submissionStatus")]
  public string? SubmissionStatus { get; set; }

  [JsonPropertyName("tenantId")]
  public string? TenantId { get; set; }

  [JsonPropertyName("updateDateTime")]
  public string? UpdateDateTime { get; set; }

  [JsonPropertyName("updatedBy")]
  public string? UpdatedBy { get; set; }
}

internal sealed class CreatedBy
{
  [JsonPropertyName("id")]
  public string? Id { get; set; }

  [JsonPropertyName("name")]
  public string? Name { get; set; }
}

internal sealed class Disposition
{
  [JsonPropertyName("date")]
  public string? Date { get; set; }

  [JsonPropertyName("id")]
  public string? Id { get; set; }

  [JsonPropertyName("reason")]
  public string? Reason { get; set; }

  [JsonPropertyName("status")]
  public string? Status { get; set; }
}

