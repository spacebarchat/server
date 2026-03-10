use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json::Value;

#[napi]
fn serialize(value: Value) -> Result<String> {
    serde_json::to_string(&value).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
}

#[napi]
fn deserialize(json: String) -> Result<Value> {
    serde_json::from_str(&json).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
}
