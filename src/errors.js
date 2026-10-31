function redact(value, secrets = []) {
  let result = String(value || "Unknown error");
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length >= 4) {
      result = result.split(secret).join("[REDACTED]");
    }
  }
  result = result.replace(/([?&]access_token=)[^&\s]+/gi, "$1[REDACTED]");
  return result;
}

function safeErrorMessage(error, secrets = []) {
  const message = error instanceof Error ? error.message : error;
  return redact(message, secrets);
}

module.exports = { redact, safeErrorMessage };
