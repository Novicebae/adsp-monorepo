package ca.ab.gov.alberta.adsp.sdk.events;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DomainEvent<T> {
  @JsonProperty
  private String namespace;

  @JsonProperty
  private String name;

  @JsonProperty
  private Instant timestamp;

  @JsonProperty
  private String correlationId;

  @JsonProperty
  private final T payload;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Instant timestamp) {
    this.timestamp = timestamp;
  }

  String getNamespace() {
    return namespace;
  }

  void setNamespace(String namespace) {
    this.namespace = namespace;
  }

  public String getCorrelationId() {
    return correlationId;
  }

  public void setCorrelationId(String correlationId) {
    this.correlationId = correlationId;
  }

  public T getPayload() {
    return payload;
  }

  public DomainEvent(String name, Instant timestamp, T payload) {
    this.name = name;
    this.timestamp = timestamp;
    this.payload = payload;
  }
}
